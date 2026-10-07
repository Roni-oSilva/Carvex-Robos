import { formatBRL, render } from "../../../shared/utils/text.ts";
import type { CobraSettings, PassoRegua } from "./settings.ts";
import type { Charge } from "./store.ts";

export const fmtData = (ymd: string): string => ymd.split("-").reverse().slice(0, 2).join("/");

export function diasEntre(aYmd: string, bYmd: string): number {
  const [y1, m1, d1] = aYmd.split("-").map(Number), [y2, m2, d2] = bYmd.split("-").map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000);
}

const plural = (n: number, s: string, p: string): string => `${n} ${n === 1 ? s : p}`;

export function situacao(c: Charge, hoje: string): string {
  const atraso = diasEntre(c.due_date, hoje);
  if (atraso > 0) return `em atraso há ${plural(atraso, "dia", "dias")}`;
  if (atraso === 0) return "vence hoje";
  return `vence em ${plural(-atraso, "dia", "dias")}`;
}

export function resumo(cs: Charge[], hoje: string): string {
  return cs.map((c) => `• ${c.description} — ${formatBRL(c.amount_cents)} — venc. ${fmtData(c.due_date)} (${situacao(c, hoje)})`).join("\n");
}

export const RODAPE = "Responda PARAR para não receber mais avisos automáticos.";

/** Texto de UM passo da régua para UMA cobrança. */
export function textoPasso(s: CobraSettings, passo: PassoRegua, c: Charge, hoje: string, nome: string): string {
  const vars = { nome, empresa: s.empresa.nome, descricao: c.description, valor: formatBRL(c.amount_cents), vencimento: fmtData(c.due_date), dias_atraso: Math.max(0, diasEntre(c.due_date, hoje)) };
  if (passo.mensagem) return render(passo.mensagem, vars);
  if (passo.dias < 0) return `Passando para lembrar que *${vars.descricao}*, no valor de *${vars.valor}*, vence em ${vars.vencimento}. 😊`;
  if (passo.dias === 0) return `*${vars.descricao}* (${vars.valor}) vence *hoje*. Se já pagou, desconsidere esta mensagem.`;
  if (passo.dias < 7) return `Notamos que *${vars.descricao}* (${vars.valor}), com vencimento em ${vars.vencimento}, ainda está em aberto. Pode ser que o pagamento já tenha sido feito — se for o caso, responda PAGUEI e a gente confere.`;
  return `*${vars.descricao}* (${vars.valor}) está em aberto há ${vars.dias_atraso} dias (venc. ${vars.vencimento}). Quer ajuda para regularizar? Dá para pagar agora por Pix ou combinar uma forma que caiba no seu bolso.`;
}

export function textoContato(s: CobraSettings, itens: { charge: Charge; passo: PassoRegua }[], hoje: string, nome: string): string {
  const saud = `Olá${nome ? `, ${nome}` : ""}! Aqui é a ${s.empresa.nome}.`;
  const corpo = itens.length === 1
    ? textoPasso(s, itens[0].passo, itens[0].charge, hoje, nome)
    : `Estes pagamentos estão pendentes:\n${resumo(itens.map((i) => i.charge), hoje)}\nSe já pagou algum deles, responda PAGUEI.`;
  return `${saud}\n\n${corpo}\n\n${RODAPE}`;
}
