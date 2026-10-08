import { sendProactive, type ProactiveResult } from "../../../shared/engine/proactive.ts";
import type { BotEnv } from "../../../shared/engine/types.ts";
import type { Tenant } from "../../../shared/database/repo.ts";
import { formatBRL } from "../../../shared/utils/text.ts";
import { localDate } from "../../../shared/utils/time.ts";
import type { OrcaSettings } from "./settings.ts";
import type { Quote } from "./store.ts";

/** "2026-10-14T..." (UTC) -> "14/10/2026" no fuso da empresa. */
export function dataBr(iso: string, tz: string): string {
  const [y, m, d] = localDate(new Date(iso), tz).split("-");
  return `${d}/${m}/${y}`;
}

export function textoProposta(q: Quote, tz: string): string {
  const linhas = [
    `*Orçamento #${q.numero}* — ${q.servico_nome}`,
    `Valor: *${formatBRL(q.valor_cents ?? 0)}*`,
    ...(q.prazo_texto ? [`Prazo: ${q.prazo_texto}`] : []),
    ...(q.obs_proposta ? [q.obs_proposta] : []),
    ...(q.validade_ate ? [`Proposta válida até ${dataBr(q.validade_ate, tz)}.`] : []),
  ];
  return linhas.join("\n");
}

const botoes = (id: number) => [{ id: `oz_ok_${id}`, title: "Aceitar" }, { id: `oz_no_${id}`, title: "Recusar" }, { id: `oz_duv_${id}`, title: "Tenho dúvida" }];

/** Envia a proposta ao cliente (botões dentro das 24 h; modelo aprovado fora delas). */
export async function enviarPropostaAoCliente(env: BotEnv, tenant: Tenant, s: OrcaSettings, q: Quote, now: Date): Promise<ProactiveResult | "ignorado"> {
  const contact = env.repo.contact(tenant.id, q.contact_id);
  if (!contact) return "ignorado";
  const text = textoProposta(q, tenant.timezone);
  return sendProactive(env, tenant, contact, {
    text, buttons: botoes(q.id),
    template: s.template.nome ? { name: s.template.nome, language: s.template.idioma, params: [q.nome.split(" ")[0], String(q.numero), text, s.empresa.nome] } : undefined,
  }, now);
}

export async function lembreteProposta(env: BotEnv, tenant: Tenant, s: OrcaSettings, q: Quote, now: Date): Promise<ProactiveResult | "ignorado"> {
  const contact = env.repo.contact(tenant.id, q.contact_id);
  if (!contact) return "ignorado";
  const text = `Oi, ${q.nome.split(" ")[0]}! Passando para saber se você viu o orçamento #${q.numero} (${q.servico_nome}). Ele vale até ${dataBr(q.validade_ate ?? now.toISOString(), tenant.timezone)}. Podemos seguir?`;
  return sendProactive(env, tenant, contact, {
    text, buttons: botoes(q.id),
    template: s.template.nome ? { name: s.template.nome, language: s.template.idioma, params: [q.nome.split(" ")[0], String(q.numero), text, s.empresa.nome] } : undefined,
  }, now);
}

/** Aviso de que o orçamento venceu (só texto/modelo; nunca reabre sozinho). */
export async function avisoExpirou(env: BotEnv, tenant: Tenant, s: OrcaSettings, q: Quote, now: Date): Promise<ProactiveResult | "ignorado"> {
  const contact = env.repo.contact(tenant.id, q.contact_id);
  if (!contact) return "ignorado";
  const text = `O orçamento #${q.numero} (${q.servico_nome}) venceu. Se ainda tiver interesse, responda por aqui que a equipe atualiza o valor.`;
  return sendProactive(env, tenant, contact, {
    text,
    template: s.template.nome ? { name: s.template.nome, language: s.template.idioma, params: [q.nome.split(" ")[0], String(q.numero), text, s.empresa.nome] } : undefined,
  }, now);
}
