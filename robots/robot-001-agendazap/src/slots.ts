import { addDays, addMinutes, localDate, parseHHMM, pad2, weekdayOf, zonedToUtc } from "../../../shared/utils/time.ts";
import type { AgendaSettings, Profissional, Servico } from "./settings.ts";

export interface Booked { professional_id: string; starts_at: string; ends_at: string }
export interface Slot { profId: string; start: Date }

export function professionalsFor(s: AgendaSettings, svc: Servico): Profissional[] {
  return s.profissionais.filter((p) => !svc.profissionais || svc.profissionais.includes(p.id));
}

/** Horários livres de um dia (data local "AAAA-MM-DD"). Nunca devolve horário passado, em folga ou conflitante. */
export function freeSlots(args: { settings: AgendaSettings; tz: string; now: Date; service: Servico; day: string; booked: Booked[]; professionalId?: string }): Slot[] {
  const { settings: s, tz, now, service, day, booked } = args;
  const earliest = addMinutes(now, s.agenda.antecedencia_horas * 60);
  const [y, m, d] = day.split("-").map(Number);
  const out: Slot[] = [];

  for (const p of professionalsFor(s, service)) {
    if (args.professionalId && p.id !== args.professionalId) continue;
    if (p.folgas.includes(day)) continue;
    const h = p.horario[String(weekdayOf(day))];
    if (!h) continue;
    const abre = parseHHMM(h.abre), fecha = parseHHMM(h.fecha);
    if (abre === null || fecha === null) continue;
    const mine = booked.filter((b) => b.professional_id === p.id);

    for (let t = abre; t + service.duracao_min <= fecha; t += s.agenda.intervalo_min) {
      const start = zonedToUtc(y, m, d, Math.floor(t / 60), t % 60, tz);
      if (start < earliest) continue;
      const end = addMinutes(start, service.duracao_min);
      const clash = mine.some((b) => new Date(b.starts_at) < end && new Date(b.ends_at) > start);
      if (!clash) out.push({ profId: p.id, start });
    }
  }
  return out.sort((a, b) => a.start.getTime() - b.start.getTime());
}

/** Sem preferência de profissional: um slot por horário, atribuído ao primeiro livre. */
export function dedupeByStart(slots: Slot[]): Slot[] {
  const seen = new Set<number>();
  return slots.filter((x) => (seen.has(x.start.getTime()) ? false : (seen.add(x.start.getTime()), true)));
}

export function candidateDays(s: AgendaSettings, tz: string, now: Date): string[] {
  const today = localDate(now, tz);
  return Array.from({ length: s.agenda.dias_max + 1 }, (_, i) => addDays(today, i));
}

export const dayLabel = (ymd: string, today: string): string => {
  const [y, m, d] = ymd.split("-").map(Number);
  const dias = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
  const base = `${dias[weekdayOf(ymd)]} ${pad2(d)}/${pad2(m)}`;
  if (ymd === today) return `Hoje (${base})`;
  if (ymd === addDays(today, 1)) return `Amanhã (${base})`;
  void y;
  return base;
};
