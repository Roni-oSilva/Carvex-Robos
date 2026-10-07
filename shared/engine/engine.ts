import { normalize } from "../utils/text.ts";
import type { Outgoing, InboundMessage } from "../whatsapp/types.ts";
import type { Tenant } from "../database/repo.ts";
import { customMsg, loadSettings } from "./settings.ts";
import type { BotEnv, ConvState, FlowContext, Robot } from "./types.ts";

const OPTOUT_EXACT = new Set(["parar", "stop", "descadastrar", "sair da lista", "nao quero receber", "nao quero mais receber", "nao quero receber mensagens"]);
const OPTIN_EXACT = new Set(["reativar"]);
const HUMAN_WORDS = ["atendente", "humano", "atendimento humano", "falar com alguem", "falar com uma pessoa"];

export type InboundOutcome = "ignored" | "duplicate" | "rate_limited" | "optout" | "optin" | "human_request" | "human_mode" | "bot" | "error";

function bodyOf(msg: InboundMessage): string {
  if (msg.type === "text" || msg.type === "button" || msg.type === "list") return msg.text ?? "";
  return `[${msg.type}]${msg.text ? " " + msg.text : ""}`;
}

export function resolveTenant<S>(env: BotEnv, msg: InboundMessage): Tenant | undefined {
  const byPhone = msg.phoneNumberId ? env.repo.tenantByPhoneNumberId(msg.phoneNumberId) : undefined;
  if (byPhone) return byPhone;
  // Instalação de uma única empresa ainda sem phone_number_id cadastrado.
  const all = env.repo.tenants();
  return all.length === 1 && !all[0].phone_number_id ? all[0] : undefined;
}

export async function deliver(env: BotEnv, tenant: Tenant, contactId: number, waId: string, out: Outgoing[], now: Date): Promise<void> {
  for (const o of out) {
    const body = o.kind === "template" ? `[template ${o.name}] ${o.params.join(" | ")}` : o.body;
    try {
      const r = await env.wa.send(waId, o, { phoneNumberId: tenant.phone_number_id ?? undefined });
      env.repo.logMessage({ tenantId: tenant.id, contactId, direction: "out", waMessageId: r.id, type: o.kind, body }, now);
    } catch (e) {
      env.log.error("envio_falhou", { to: waId, erro: e instanceof Error ? e.message : String(e) });
      env.repo.logMessage({ tenantId: tenant.id, contactId, direction: "out", type: o.kind, body, status: "failed" }, now);
    }
  }
}

export async function processInbound<S>(env: BotEnv, robot: Robot<S>, msg: InboundMessage): Promise<InboundOutcome> {
  const now = env.clock();
  const tenant = resolveTenant(env, msg);
  if (!tenant) {
    env.log.warn("webhook_sem_empresa", { phone_number_id: msg.phoneNumberId });
    return "ignored";
  }
  if (!env.repo.markProcessed(msg.id, now)) return "duplicate";
  if (!env.contactLimiter.allow(`${tenant.id}:${msg.from}`, now.getTime())) {
    env.log.warn("contato_limitado", { from: msg.from });
    return "rate_limited";
  }

  const contact = env.repo.upsertContact(tenant.id, msg.from, msg.name, now, "iniciou_conversa");
  env.repo.touchInbound(contact.id, now);
  env.repo.logMessage({ tenantId: tenant.id, contactId: contact.id, direction: "in", waMessageId: msg.id, type: msg.type, body: bodyOf(msg) }, now);
  void env.wa.markRead?.(msg.id, { phoneNumberId: tenant.phone_number_id ?? undefined })?.catch(() => {});

  const settings = loadSettings(env, robot, tenant);
  const row = env.repo.conversationFor(tenant.id, contact.id, now);
  let data: Record<string, unknown> = {};
  try { data = JSON.parse(row.data) as Record<string, unknown>; } catch { data = {}; }
  const conv: ConvState = { id: row.id, state: row.state, data, mode: row.mode, handoff_reason: row.handoff_reason };
  const persist = () => env.repo.saveConversation({ ...conv, data: JSON.stringify(conv.data) }, env.clock());
  const reply = async (out: Outgoing[]) => deliver(env, tenant, contact.id, contact.wa_id, out, env.clock());

  const norm = normalize(msg.type === "text" || msg.type === "button" || msg.type === "list" ? msg.text ?? "" : "");

  // Opt-out / opt-in (LGPD): sempre honrado, em qualquer estado.
  if (OPTOUT_EXACT.has(norm)) {
    env.repo.setOptOut(contact.id, true, now);
    env.repo.event(tenant.id, "optout", {}, now);
    await reply([{ kind: "text", body: "Pronto! Você não receberá mais mensagens automáticas (lembretes e avisos). Se precisar de algo, é só nos chamar por aqui. Para voltar a receber, envie REATIVAR." }]);
    return "optout";
  }
  if (OPTIN_EXACT.has(norm)) {
    env.repo.setOptOut(contact.id, false, now);
    await reply([{ kind: "text", body: "Tudo certo! Você voltará a receber nossos avisos e lembretes. 😊" }]);
    return "optin";
  }

  // Retoma o robô automaticamente se o atendimento humano ficou parado.
  if (conv.mode === "human") {
    const idleH = (now.getTime() - new Date(row.updated_at).getTime()) / 3_600_000;
    if (idleH >= env.config.handoffResumeHours) { conv.mode = "bot"; conv.handoff_reason = null; conv.state = "inicio"; }
  }

  if (conv.mode === "human") {
    persist();
    env.repo.event(tenant.id, "human_message", {}, now);
    return "human_mode";
  }

  if (HUMAN_WORDS.some((w) => norm === w || norm.split(" ").includes(w) || (w.includes(" ") && norm.includes(w)))) {
    conv.mode = "human";
    conv.handoff_reason = "pedido do cliente";
    persist();
    env.repo.event(tenant.id, "handoff", { motivo: conv.handoff_reason }, now);
    await reply([{ kind: "text", body: customMsg(settings, "handoff", "Certo! Já chamei um atendente. Ele responde assim que possível, por aqui mesmo. 🙂") }]);
    return "human_request";
  }

  const ctx: FlowContext<S> = { env, tenant, settings, contact, conv, now };
  try {
    const out = await robot.handle(ctx, msg);
    persist();
    // O fluxo pode ter chamado requestHandoff() e mudado o modo durante o turno.
    if ((conv.mode as string) === "human") env.repo.event(tenant.id, "handoff", { motivo: conv.handoff_reason }, now);
    await reply(out);
    return "bot";
  } catch (e) {
    env.log.error("fluxo_falhou", { erro: e instanceof Error ? e.stack : String(e) });
    conv.mode = "human";
    conv.handoff_reason = "erro interno";
    persist();
    env.repo.event(tenant.id, "handoff", { motivo: "erro interno" }, now);
    await reply([{ kind: "text", body: "Tive um problema para processar sua mensagem. Já chamei um atendente para ajudar você. 🙏" }]);
    return "error";
  }
}

/** Usado pelos robôs para encaminhar ao humano dentro do fluxo. */
export function requestHandoff<S>(ctx: FlowContext<S>, reason: string, message?: string): Outgoing[] {
  ctx.conv.mode = "human";
  ctx.conv.handoff_reason = reason;
  return [{ kind: "text", body: message ?? customMsg(ctx.settings, "handoff", "Certo! Já chamei um atendente. Ele responde assim que possível, por aqui mesmo. 🙂") }];
}
