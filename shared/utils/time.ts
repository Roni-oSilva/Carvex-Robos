/** Datas/horas em fuso do negócio usando só Intl (sem libs). Datas internas sempre em UTC ISO. */

export interface Parts { year: number; month: number; day: number; hour: number; minute: number; weekday: number }

const WEEKDAYS: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

export function zonedParts(date: Date, tz: string): Parts {
  const f = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", weekday: "short",
  });
  const p: Record<string, string> = {};
  for (const x of f.formatToParts(date)) p[x.type] = x.value;
  return {
    year: Number(p.year), month: Number(p.month), day: Number(p.day),
    hour: Number(p.hour) % 24, minute: Number(p.minute), weekday: WEEKDAYS[p.weekday] ?? 0,
  };
}

/** Converte data/hora local do fuso `tz` para um Date UTC. */
export function zonedToUtc(y: number, mo: number, d: number, h: number, mi: number, tz: string): Date {
  let guess = Date.UTC(y, mo - 1, d, h, mi);
  for (let i = 0; i < 3; i++) {
    const p = zonedParts(new Date(guess), tz);
    const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
    const diff = Date.UTC(y, mo - 1, d, h, mi) - asUtc;
    if (diff === 0) break;
    guess += diff;
  }
  return new Date(guess);
}

export const pad2 = (n: number): string => String(n).padStart(2, "0");

/** "2026-10-07" no fuso do negócio. */
export function localDate(date: Date, tz: string): string {
  const p = zonedParts(date, tz);
  return `${p.year}-${pad2(p.month)}-${pad2(p.day)}`;
}

/** "14:30" no fuso do negócio. */
export function localTime(date: Date, tz: string): string {
  const p = zonedParts(date, tz);
  return `${pad2(p.hour)}:${pad2(p.minute)}`;
}

/** "07/10 14:30" para mensagens. */
export function localDateTimeLabel(date: Date, tz: string): string {
  const p = zonedParts(date, tz);
  return `${pad2(p.day)}/${pad2(p.month)} às ${pad2(p.hour)}:${pad2(p.minute)}`;
}

const DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
export const nomeDiaSemana = (i: number): string => DIAS[i] ?? "";

/** Soma dias a uma data "YYYY-MM-DD" (calendário, sem fuso). */
export function addDays(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return `${dt.getUTCFullYear()}-${pad2(dt.getUTCMonth() + 1)}-${pad2(dt.getUTCDate())}`;
}

export function weekdayOf(ymd: string): number {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function parseHHMM(s: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const h = Number(m[1]), mi = Number(m[2]);
  if (h > 23 || mi > 59) return null;
  return h * 60 + mi;
}

export interface HorarioDia { abre: string; fecha: string }
/** horario: { "1": {abre:"09:00",fecha:"18:00"}, ... } (0=domingo). Dia ausente = fechado. */
export type Horario = Record<string, HorarioDia | undefined>;

export function estaAberto(horario: Horario, now: Date, tz: string): boolean {
  const p = zonedParts(now, tz);
  const h = horario[String(p.weekday)];
  if (!h) return false;
  const a = parseHHMM(h.abre), f = parseHHMM(h.fecha);
  if (a === null || f === null) return false;
  const cur = p.hour * 60 + p.minute;
  return cur >= a && cur < f;
}

export const addMinutes = (d: Date, min: number): Date => new Date(d.getTime() + min * 60_000);
export const addHours = (d: Date, h: number): Date => new Date(d.getTime() + h * 3_600_000);
