import { addHours } from "../utils/time.ts";

/**
 * Janela de atendimento do WhatsApp: texto livre só é permitido por 24h após a ÚLTIMA
 * mensagem recebida do cliente. Fora dela, só mensagem de template aprovada.
 */
export function inServiceWindow(lastInboundAtIso: string | null | undefined, now: Date): boolean {
  if (!lastInboundAtIso) return false;
  const last = new Date(lastInboundAtIso);
  if (Number.isNaN(last.getTime())) return false;
  return now.getTime() < addHours(last, 24).getTime();
}
