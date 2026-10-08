import { sendProactive } from "../../../shared/engine/proactive.ts";
import { loadSettings } from "../../../shared/engine/settings.ts";
import type { BotEnv, Robot } from "../../../shared/engine/types.ts";
import type { Tenant } from "../../../shared/database/repo.ts";
import { formatBRL } from "../../../shared/utils/text.ts";
import { localDateTimeLabel } from "../../../shared/utils/time.ts";
import { botoesVisita } from "./flow.ts";
import { compativeis } from "./match.ts";
import type { LeadSettings } from "./settings.ts";
import { cents } from "./settings.ts";
import type { Lead, Visit } from "./store.ts";

function comHumano(env: BotEnv, contactId: number, now: Date): boolean {
  const conv = env.db.get<{ mode: string; updated_at: string }>("SELECT mode, updated_at FROM conversations WHERE contact_id = ?", contactId);
  return conv?.mode === "human" && now.getTime() - new Date(conv.updated_at).getTime() < env.config.handoffResumeHours * 3_600_000;
}

const tpl = (s: LeadSettings, nome: string, texto: string) => (s.template.nome ? { name: s.template.nome, language: s.template.idioma, params: [nome.split(" ")[0], texto, s.empresa.nome] } : undefined);

async function lembretesDeVisita(env: BotEnv, tenant: Tenant, s: LeadSettings, now: Date): Promise<number> {
  if (!s.visitas.ativo) return 0;
  const ate = new Date(now.getTime() + s.visitas.lembrete_horas * 3_600_000).toISOString();
  const vs = env.db.all<Visit & { nome: string }>(
    `SELECT v.*, l.nome FROM visits v JOIN leads l ON l.id = v.lead_id WHERE v.tenant_id = ? AND v.status IN ('agendada','confirmada') AND v.lembrete_enviado = 0 AND v.starts_at > ? AND v.starts_at <= ? LIMIT 500`,
    tenant.id, now.toISOString(), ate);
  let n = 0;
  for (const v of vs) {
    const contact = env.repo.contact(tenant.id, v.contact_id);
    if (!contact) continue;
    env.db.run("UPDATE visits SET lembrete_enviado = 1, updated_at = ? WHERE id = ?", now.toISOString(), v.id); // antes de enviar: sem duplicar se a rodada cair
    const texto = `Lembrete da sua visita: ${v.imovel_titulo}, ${localDateTimeLabel(new Date(v.starts_at), tenant.timezone)}. Você confirma presença?`;
    const r = await sendProactive(env, tenant, contact, { text: texto, buttons: botoesVisita(v.id), template: tpl(s, v.nome, texto) }, now);
    if (r === "sent" || r === "sent_template") n++;
  }
  return n;
}

async function acompanharLeads(env: BotEnv, tenant: Tenant, s: LeadSettings, now: Date): Promise<number> {
  const limite = new Date(now.getTime() - s.followup.horas * 3_600_000).toISOString();
  const leads = env.db.all<Lead>(
    `SELECT l.* FROM leads l WHERE l.tenant_id = ? AND l.status IN ('novo','em_contato') AND l.followup_enviado = 0 AND l.ultimo_cliente_em <= ?
       AND NOT EXISTS (SELECT 1 FROM visits v WHERE v.lead_id = l.id AND v.status IN ('agendada','confirmada')) LIMIT 300`, tenant.id, limite);
  let n = 0;
  for (const l of leads) {
    const contact = env.repo.contact(tenant.id, l.contact_id);
    if (!contact || contact.opt_out || comHumano(env, l.contact_id, now)) continue;
    env.db.run("UPDATE leads SET followup_enviado = 1, updated_at = ? WHERE id = ?", now.toISOString(), l.id);
    // Só fala de imóveis que existem no cadastro e cabem no perfil — senão, uma pergunta simples.
    const lista = compativeis(s, { finalidade: l.finalidade, tipoId: l.tipo_id, bairro: l.bairro, minCents: l.faixa_min_cents, maxCents: l.faixa_max_cents, quartos: l.quartos }, 2);
    const texto = lista.length
      ? `Oi, ${l.nome.split(" ")[0]}! Separei ${lista.length === 1 ? "uma opção" : "opções"} dentro do que você procura: ${lista.map((i) => `${i.titulo} (${formatBRL(cents(i.preco))})`).join("; ")}. Quer ver os detalhes ou marcar uma visita?`
      : `Oi, ${l.nome.split(" ")[0]}! Você ainda está procurando ${l.finalidade === "alugar" ? "um imóvel para alugar" : "um imóvel para comprar"} em ${l.bairro}? Posso te ajudar a continuar.`;
    const r = await sendProactive(env, tenant, contact, { text: texto, buttons: [{ id: l.finalidade === "alugar" ? "m_alugar" : "m_comprar", title: "Quero continuar" }, { id: "m_corretor", title: "Falar com corretor" }], template: tpl(s, l.nome, texto) }, now);
    if (r === "sent" || r === "sent_template") { n++; env.repo.event(tenant.id, "lead_followup", { id: l.id }, now); }
  }
  // Sem resposta há muito tempo: sai da fila quente e vai para "sem resposta" (a equipe decide).
  const corte = new Date(now.getTime() - s.followup.sem_resposta_dias * 86_400_000).toISOString();
  env.db.run("UPDATE leads SET status = 'sem_resposta', updated_at = ? WHERE tenant_id = ? AND status IN ('novo','em_contato') AND followup_enviado = 1 AND ultimo_cliente_em <= ?", now.toISOString(), tenant.id, corte);
  return n;
}

export async function rodarAcompanhamento(env: BotEnv, robot: Robot<LeadSettings>, now: Date): Promise<number> {
  let total = 0;
  for (const tenant of env.repo.tenants()) {
    const s = loadSettings(env, robot, tenant);
    total += await lembretesDeVisita(env, tenant, s, now);
    total += await acompanharLeads(env, tenant, s, now);
  }
  return total;
}
