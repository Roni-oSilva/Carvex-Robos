import { addDays, localDate, nomeDiaSemana, pad2, parseHHMM, weekdayOf, zonedToUtc } from "../../../shared/utils/time.ts";
import type { LeadSettings } from "./settings.ts";
import type { LeadStore } from "./store.ts";

export interface Dia { ymd: string; label: string }

const labelDia = (ymd: string): string => {
  const [, m, d] = ymd.split("-");
  return `${nomeDiaSemana(weekdayOf(ymd)).slice(0, 3)} ${d}/${m}`;
};

export function inicioDe(ymd: string, hhmm: string, tz: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  const min = parseHHMM(hhmm) ?? 0;
  return zonedToUtc(y, m, d, Math.floor(min / 60), min % 60, tz);
}

/** Horários livres de um imóvel em um dia (respeita antecedência mínima e visitas já marcadas). */
export function horariosLivres(s: LeadSettings, store: LeadStore, tenantId: number, imovelId: string, ymd: string, now: Date, tz: string): string[] {
  if (!s.visitas.dias_semana.includes(weekdayOf(ymd))) return [];
  const minimo = now.getTime() + s.visitas.antecedencia_horas * 3_600_000;
  return [...s.visitas.horarios].sort().filter((h) => {
    const t = inicioDe(ymd, h, tz);
    return t.getTime() >= minimo && !store.ocupado(tenantId, imovelId, t);
  });
}

export function diasDisponiveis(s: LeadSettings, store: LeadStore, tenantId: number, imovelId: string, now: Date, tz: string): Dia[] {
  const hoje = localDate(now, tz);
  const out: Dia[] = [];
  for (let i = 0; i <= s.visitas.janela_dias && out.length < 9; i++) {
    const ymd = addDays(hoje, i);
    if (horariosLivres(s, store, tenantId, imovelId, ymd, now, tz).length) out.push({ ymd, label: labelDia(ymd) });
  }
  return out;
}

export { labelDia, pad2 };
