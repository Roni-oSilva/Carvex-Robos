import type { Db } from "../../../shared/database/db.ts";

export type ChargeStatus = "aberta" | "em_conferencia" | "paga" | "acordo" | "cancelada";
export interface Charge {
  id: number; tenant_id: number; contact_id: number; reference: string | null; description: string; amount_cents: number;
  due_date: string; pix_code: string | null; link: string | null; status: ChargeStatus; paused_until: string | null;
  paid_at: string | null; created_at: string; updated_at: string;
}
export interface Acordo { id: number; tenant_id: number; charge_id: number; parcelas: number; parcela_cents: number; total_cents: number; status: "proposto" | "aceito" | "recusado"; created_at: string }

export class CobraStore {
  db: Db;
  constructor(db: Db) { this.db = db; }

  charge(tenantId: number, id: number): Charge | undefined {
    return this.db.get<Charge>("SELECT * FROM charges WHERE tenant_id = ? AND id = ?", tenantId, id);
  }

  openFor(tenantId: number, contactId: number): Charge[] {
    return this.db.all<Charge>("SELECT * FROM charges WHERE tenant_id = ? AND contact_id = ? AND status IN ('aberta','em_conferencia') ORDER BY due_date, id", tenantId, contactId);
  }

  hasAny(tenantId: number, contactId: number): boolean {
    return !!this.db.get("SELECT 1 FROM charges WHERE tenant_id = ? AND contact_id = ?", tenantId, contactId);
  }

  create(c: { tenantId: number; contactId: number; reference?: string | null; description: string; amountCents: number; dueDate: string; pixCode?: string | null; link?: string | null }, now: Date): number | null {
    try {
      return this.db.run(
        `INSERT INTO charges (tenant_id, contact_id, reference, description, amount_cents, due_date, pix_code, link, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)`,
        c.tenantId, c.contactId, c.reference ?? null, c.description, c.amountCents, c.dueDate, c.pixCode ?? null, c.link ?? null, now.toISOString(), now.toISOString()).lastId;
    } catch (e) {
      if (e instanceof Error && /UNIQUE/.test(e.message)) return null; // referência repetida
      throw e;
    }
  }

  setStatus(tenantId: number, id: number, status: ChargeStatus, now: Date): void {
    const paid = status === "paga" ? now.toISOString() : null;
    this.db.run("UPDATE charges SET status = ?, paid_at = COALESCE(?, paid_at), paused_until = NULL, updated_at = ? WHERE tenant_id = ? AND id = ?", status, paid, now.toISOString(), tenantId, id);
  }

  pause(tenantId: number, id: number, untilIso: string, now: Date): void {
    this.db.run("UPDATE charges SET paused_until = ?, updated_at = ? WHERE tenant_id = ? AND id = ?", untilIso, now.toISOString(), tenantId, id);
  }

  byReference(tenantId: number, reference: string): Charge | undefined {
    return this.db.get<Charge>("SELECT * FROM charges WHERE tenant_id = ? AND reference = ?", tenantId, reference);
  }

  // ---- envios (histórico e limites)
  stepSent(chargeId: number, stepId: string): boolean {
    return !!this.db.get("SELECT 1 FROM cz_envios WHERE charge_id = ? AND step_id = ?", chargeId, stepId);
  }

  logSend(tenantId: number, contactId: number, chargeId: number | null, stepId: string, result: string, now: Date): void {
    this.db.run("INSERT INTO cz_envios (tenant_id, contact_id, charge_id, step_id, result, sent_at) VALUES (?,?,?,?,?,?)", tenantId, contactId, chargeId, stepId, result, now.toISOString());
  }

  /** Mensagens de cobrança ENVIADAS (não conta "pulado"/"adiado") ao contato desde `sinceIso`. */
  sendsSince(contactId: number, sinceIso: string): { n: number; last: string | null } {
    const r = this.db.get<{ n: number; last: string | null }>(
      "SELECT COUNT(DISTINCT sent_at) n, MAX(sent_at) last FROM cz_envios WHERE contact_id = ? AND sent_at >= ? AND result IN ('sent','sent_template','identidade')", contactId, sinceIso)!;
    return r;
  }

  // ---- titularidade
  client(tenantId: number, contactId: number): { identity_confirmed_at: string | null; identity_asked_at: string | null; wrong_number: number } {
    this.db.run("INSERT OR IGNORE INTO cz_clientes (contact_id, tenant_id) VALUES (?,?)", contactId, tenantId);
    return this.db.get(`SELECT identity_confirmed_at, identity_asked_at, wrong_number FROM cz_clientes WHERE contact_id = ?`, contactId)!;
  }
  confirmIdentity(tenantId: number, contactId: number, now: Date): void {
    this.client(tenantId, contactId);
    this.db.run("UPDATE cz_clientes SET identity_confirmed_at = ?, wrong_number = 0 WHERE contact_id = ?", now.toISOString(), contactId);
  }
  markAsked(tenantId: number, contactId: number, now: Date): void {
    this.client(tenantId, contactId);
    this.db.run("UPDATE cz_clientes SET identity_asked_at = ? WHERE contact_id = ?", now.toISOString(), contactId);
  }
  markWrongNumber(tenantId: number, contactId: number): void {
    this.client(tenantId, contactId);
    this.db.run("UPDATE cz_clientes SET wrong_number = 1, identity_confirmed_at = NULL WHERE contact_id = ?", contactId);
  }

  // ---- acordos
  propose(tenantId: number, chargeId: number, parcelas: number, parcelaCents: number, totalCents: number, now: Date): number {
    return this.db.run("INSERT INTO cz_acordos (tenant_id, charge_id, parcelas, parcela_cents, total_cents, created_at) VALUES (?,?,?,?,?,?)", tenantId, chargeId, parcelas, parcelaCents, totalCents, now.toISOString()).lastId;
  }
  decide(tenantId: number, id: number, status: "aceito" | "recusado", now: Date): Acordo | undefined {
    this.db.run("UPDATE cz_acordos SET status = ?, decided_at = ? WHERE tenant_id = ? AND id = ? AND status = 'proposto'", status, now.toISOString(), tenantId, id);
    return this.db.get<Acordo>("SELECT * FROM cz_acordos WHERE tenant_id = ? AND id = ?", tenantId, id);
  }
}
