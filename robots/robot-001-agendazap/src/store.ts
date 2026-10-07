import type { Db } from "../../../shared/database/db.ts";
import { addMinutes } from "../../../shared/utils/time.ts";
import type { Booked } from "./slots.ts";
import type { AgendaSettings, Servico } from "./settings.ts";

export interface Appointment {
  id: number; tenant_id: number; contact_id: number; service_id: string; service_name: string;
  professional_id: string; professional_name: string; starts_at: string; ends_at: string; price_cents: number;
  status: "agendado" | "confirmado" | "cancelado" | "concluido" | "faltou"; source: string;
  confirmed_at: string | null; cancelled_at: string | null; cancel_reason: string | null;
}
export interface WaitlistRow { id: number; tenant_id: number; contact_id: number; service_id: string; professional_id: string | null; day: string; status: string }

const ACTIVE = "('agendado','confirmado')";

export class AgendaStore {
  db: Db;
  constructor(db: Db) { this.db = db; }

  get(tenantId: number, id: number): Appointment | undefined {
    return this.db.get<Appointment>("SELECT * FROM appointments WHERE tenant_id = ? AND id = ?", tenantId, id);
  }

  bookedBetween(tenantId: number, fromIso: string, toIso: string): Booked[] {
    return this.db.all<Booked>(
      `SELECT professional_id, starts_at, ends_at FROM appointments WHERE tenant_id = ? AND status IN ${ACTIVE} AND starts_at < ? AND ends_at > ?`,
      tenantId, toIso, fromIso);
  }

  upcomingFor(tenantId: number, contactId: number, nowIso: string): Appointment[] {
    return this.db.all<Appointment>(
      `SELECT * FROM appointments WHERE tenant_id = ? AND contact_id = ? AND status IN ${ACTIVE} AND starts_at > ? ORDER BY starts_at LIMIT 10`,
      tenantId, contactId, nowIso);
  }

  /**
   * Cria o agendamento de forma atômica: confere conflito DENTRO da transação.
   * Retorna null se o horário foi ocupado por outra pessoa no meio tempo.
   */
  book(a: { tenantId: number; contactId: number; service: Servico; professionalId: string; professionalName: string; start: Date; source: string; replaceId?: number }, s: AgendaSettings, now: Date): Appointment | null {
    const end = addMinutes(a.start, a.service.duracao_min);
    return this.db.tx(() => {
      const clash = this.db.get(
        `SELECT 1 FROM appointments WHERE tenant_id = ? AND professional_id = ? AND status IN ${ACTIVE} AND starts_at < ? AND ends_at > ? AND id IS NOT ?`,
        a.tenantId, a.professionalId, end.toISOString(), a.start.toISOString(), a.replaceId ?? null);
      if (clash) return null;
      if (a.replaceId) this.cancel(a.tenantId, a.replaceId, "remarcado", now);
      const r = this.db.run(
        `INSERT INTO appointments (tenant_id, contact_id, service_id, service_name, professional_id, professional_name, starts_at, ends_at, price_cents, source, created_at, updated_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        a.tenantId, a.contactId, a.service.id, a.service.nome, a.professionalId, a.professionalName, a.start.toISOString(), end.toISOString(),
        Math.round(a.service.preco * 100), a.source, now.toISOString(), now.toISOString());
      const appt = this.get(a.tenantId, r.lastId)!;
      this.scheduleReminders(appt, s, now);
      return appt;
    });
  }

  scheduleReminders(appt: Appointment, s: AgendaSettings, now: Date): void {
    this.db.run("DELETE FROM reminders WHERE appointment_id = ? AND sent_at IS NULL", appt.id);
    if (!s.lembretes.ativo) return;
    const start = new Date(appt.starts_at);
    for (const h of s.lembretes.horas_antes) {
      const due = new Date(start.getTime() - h * 3_600_000);
      if (due <= now) continue; // lembrete que já passou da hora não é criado
      this.db.run("INSERT INTO reminders (appointment_id, hours_before, due_at) VALUES (?,?,?)", appt.id, h, due.toISOString());
    }
  }

  confirm(tenantId: number, id: number, now: Date): void {
    this.db.run("UPDATE appointments SET status = 'confirmado', confirmed_at = ?, updated_at = ? WHERE tenant_id = ? AND id = ? AND status = 'agendado'", now.toISOString(), now.toISOString(), tenantId, id);
  }

  cancel(tenantId: number, id: number, reason: string, now: Date): void {
    this.db.run("UPDATE appointments SET status = 'cancelado', cancelled_at = ?, cancel_reason = ?, updated_at = ? WHERE tenant_id = ? AND id = ? AND status IN ('agendado','confirmado')", now.toISOString(), reason, now.toISOString(), tenantId, id);
    this.db.run("DELETE FROM reminders WHERE appointment_id = ? AND sent_at IS NULL", id);
  }

  setStatus(tenantId: number, id: number, status: "concluido" | "faltou", now: Date): void {
    this.db.run("UPDATE appointments SET status = ?, updated_at = ? WHERE tenant_id = ? AND id = ? AND status IN ('agendado','confirmado')", status, now.toISOString(), tenantId, id);
    this.db.run("DELETE FROM reminders WHERE appointment_id = ? AND sent_at IS NULL", id);
  }

  // ---- lista de espera
  addWait(tenantId: number, contactId: number, serviceId: string, professionalId: string | null, day: string, now: Date): void {
    const dup = this.db.get("SELECT 1 FROM waitlist WHERE tenant_id = ? AND contact_id = ? AND service_id = ? AND day = ? AND status IN ('aguardando','avisado')", tenantId, contactId, serviceId, day);
    if (dup) return;
    this.db.run("INSERT INTO waitlist (tenant_id, contact_id, service_id, professional_id, day, created_at) VALUES (?,?,?,?,?,?)", tenantId, contactId, serviceId, professionalId, day, now.toISOString());
  }

  waitFor(tenantId: number, serviceId: string, day: string, professionalId: string, limit: number): WaitlistRow[] {
    return this.db.all<WaitlistRow>(
      `SELECT * FROM waitlist WHERE tenant_id = ? AND service_id = ? AND day = ? AND status = 'aguardando' AND (professional_id IS NULL OR professional_id = ?) ORDER BY created_at LIMIT ?`,
      tenantId, serviceId, day, professionalId, limit);
  }

  setWait(id: number, status: "avisado" | "atendido" | "cancelado", now: Date): void {
    this.db.run("UPDATE waitlist SET status = ?, notified_at = ? WHERE id = ?", status, now.toISOString(), id);
  }

  dueReminders(nowIso: string): (Appointment & { reminder_id: number; hours_before: number })[] {
    return this.db.all(
      `SELECT a.*, r.id AS reminder_id, r.hours_before FROM reminders r JOIN appointments a ON a.id = r.appointment_id
       WHERE r.sent_at IS NULL AND r.due_at <= ? AND a.starts_at > ? AND a.status IN ${ACTIVE} AND (r.next_try_at IS NULL OR r.next_try_at <= ?)
       ORDER BY r.due_at LIMIT 200`, nowIso, nowIso, nowIso);
  }

  markReminder(id: number, result: string, sentAt: string | null, nextTry: string | null): void {
    this.db.run("UPDATE reminders SET result = ?, sent_at = ?, next_try_at = ? WHERE id = ?", result, sentAt, nextTry, id);
  }
}
