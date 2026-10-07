import { sendProactive } from "../../../shared/engine/proactive.ts";
import { loadSettings } from "../../../shared/engine/settings.ts";
import type { BotEnv, Robot } from "../../../shared/engine/types.ts";
import type { Tenant } from "../../../shared/database/repo.ts";
import { localDate, parseHHMM, zonedParts } from "../../../shared/utils/time.ts";
import { diasEntre, textoContato } from "./mensagens.ts";
import type { CobraSettings, PassoRegua } from "./settings.ts";
import { CobraStore, type Charge } from "./store.ts";

/** Janela de envio permitida (dia da semana + horário local). Fora dela, NADA é enviado. */
export function dentroDaJanela(s: CobraSettings, now: Date, tz: string): boolean {
  const p = zonedParts(now, tz);
  if (!s.envio.dias_semana.includes(p.weekday)) return false;
  const cur = p.hour * 60 + p.minute;
  return cur >= (parseHHMM(s.envio.inicio) ?? 0) && cur < (parseHHMM(s.envio.fim) ?? 0);
}

const BOTOES = [{ id: "cz_pix", title: "Pagar com Pix" }, { id: "cz_pago", title: "Já paguei" }, { id: "cz_neg", title: "Negociar" }];

interface Cand extends Charge { nome: string | null; opt_out: number; wrong: number | null }

/**
 * Roda a régua de cobrança. Garantias:
 *  - só dentro da janela de envio;
 *  - 1 mensagem consolidada por pessoa, respeitando limite semanal e intervalo mínimo;
 *  - nunca para quem fez opt-out ou marcou "número errado", nem enquanto uma pessoa atende a conversa;
 *  - nunca revela valores antes da confirmação de titularidade (quando exigida);
 *  - passos antigos acumulados (cobrança importada já vencida) viram UMA mensagem do passo mais recente.
 */
export async function rodarRegua(env: BotEnv, robot: Robot<CobraSettings>, now: Date): Promise<number> {
  let enviados = 0;
  for (const tenant of env.repo.tenants()) {
    const s = loadSettings(env, robot, tenant);
    if (!dentroDaJanela(s, now, tenant.timezone)) continue;
    enviados += await rodarTenant(env, tenant, s, now);
  }
  return enviados;
}

async function rodarTenant(env: BotEnv, tenant: Tenant, s: CobraSettings, now: Date): Promise<number> {
  const store = new CobraStore(env.db);
  const hoje = localDate(now, tenant.timezone);
  const nowIso = now.toISOString();

  const rows = env.db.all<Cand>(
    `SELECT ch.*, c.nome, c.opt_out, cl.wrong_number AS wrong FROM charges ch
     JOIN contacts c ON c.id = ch.contact_id LEFT JOIN cz_clientes cl ON cl.contact_id = ch.contact_id
     WHERE ch.tenant_id = ? AND ch.status = 'aberta' AND (ch.paused_until IS NULL OR ch.paused_until <= ?)
       AND c.opt_out = 0 AND COALESCE(cl.wrong_number, 0) = 0
     ORDER BY ch.contact_id, ch.due_date LIMIT 2000`, tenant.id, nowIso);

  const porContato = new Map<number, Cand[]>();
  for (const r of rows) (porContato.get(r.contact_id) ?? porContato.set(r.contact_id, []).get(r.contact_id)!).push(r);

  let enviados = 0;
  for (const [contactId, charges] of porContato) {
    const contact = env.repo.contact(tenant.id, contactId);
    if (!contact) continue;

    // Quem está sendo atendido por uma pessoa não recebe aviso automático (até o robô retomar, como no motor de conversa).
    const conv = env.db.get<{ mode: string; updated_at: string }>("SELECT mode, updated_at FROM conversations WHERE contact_id = ?", contactId);
    if (conv?.mode === "human" && now.getTime() - new Date(conv.updated_at).getTime() < env.config.handoffResumeHours * 3_600_000) continue;

    // Limites de frequência (por pessoa, somando todas as cobranças)
    const semana = store.sendsSince(contactId, new Date(now.getTime() - 7 * 86_400_000).toISOString());
    if (semana.n >= s.envio.max_por_semana) continue;
    if (semana.last && now.getTime() - new Date(semana.last).getTime() < s.envio.intervalo_horas * 3_600_000) continue;
    const adiado = env.db.get("SELECT 1 FROM cz_envios WHERE contact_id = ? AND result = 'adiado' AND sent_at > ?", contactId, new Date(now.getTime() - 30 * 60_000).toISOString());
    if (adiado) continue;

    // Passo atual de cada cobrança (o mais recente ainda não enviado)
    const itens: { charge: Charge; passo: PassoRegua; pulados: PassoRegua[] }[] = [];
    for (const ch of charges) {
      const atraso = diasEntre(ch.due_date, hoje);
      const devidos = s.regua.filter((p) => p.dias <= atraso && !store.stepSent(ch.id, p.id));
      if (devidos.length === 0) continue;
      itens.push({ charge: ch, passo: devidos[devidos.length - 1], pulados: devidos.slice(0, -1) });
    }
    if (itens.length === 0) continue;

    const nome = contact.nome?.split(" ")[0] ?? "";
    const cli = store.client(tenant.id, contactId);
    const template = s.template.nome ? { name: s.template.nome, language: s.template.idioma } : undefined;

    // Titularidade: antes de falar de dívida, confirmar que é a pessoa certa.
    if (s.exigir_confirmacao_titular && !cli.identity_confirmed_at) {
      if (cli.identity_asked_at && now.getTime() - new Date(cli.identity_asked_at).getTime() < 7 * 86_400_000) continue;
      const texto = `Olá${nome ? `, ${nome}` : ""}! Aqui é a ${s.empresa.nome}. Você é ${nome || "o(a) titular deste número"}? Preciso confirmar antes de enviar um aviso sobre um pagamento.`;
      const r = await sendProactive(env, tenant, contact, {
        text: texto, buttons: [{ id: "id_sim", title: "Sim, sou eu" }, { id: "id_nao", title: "Número errado" }],
        template: template && { ...template, params: [nome || "cliente", s.empresa.nome, "Você é o(a) titular? Responda SIM para receber um aviso sobre um pagamento."] },
      }, now);
      if (r === "sent" || r === "sent_template") {
        store.markAsked(tenant.id, contactId, now);
        store.logSend(tenant.id, contactId, null, "identidade", "identidade", now);
        const conv = env.repo.conversationFor(tenant.id, contactId, now);
        env.repo.saveConversation({ id: conv.id, state: "aguarda_titular", data: conv.data, mode: conv.mode, handoff_reason: conv.handoff_reason }, now);
        enviados++;
      } else if (r !== "skipped_optout") store.logSend(tenant.id, contactId, null, "identidade", "adiado", now);
      continue;
    }

    const texto = textoContato(s, itens, hoje, nome);
    const r = await sendProactive(env, tenant, contact, {
      text: texto, buttons: BOTOES,
      template: template && { ...template, params: [nome || "cliente", s.empresa.nome, texto.split("\n\n").slice(1, -1).join(" ")] },
    }, now);

    if (r === "sent" || r === "sent_template") {
      for (const it of itens) {
        for (const p of it.pulados) store.logSend(tenant.id, contactId, it.charge.id, p.id, "pulado", now);
        store.logSend(tenant.id, contactId, it.charge.id, it.passo.id, r, now);
      }
      env.repo.event(tenant.id, "cobranca_enviada", { itens: itens.length }, now);
      enviados++;
    } else if (r !== "skipped_optout") {
      store.logSend(tenant.id, contactId, itens[0].charge.id, "tentativa", "adiado", now); // tenta de novo em 30 min
    }
  }
  return enviados;
}
