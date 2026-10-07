import type { Contact, Tenant } from "../database/repo.ts";
import { inServiceWindow } from "../whatsapp/window.ts";
import type { BotEnv } from "./types.ts";

export interface ProactiveMessage {
  /** Texto livre — só vai se a janela de 24h estiver aberta. */
  text: string;
  /** Template aprovado na Meta — usado quando a janela está fechada. */
  template?: { name: string; language: string; params: string[] };
}

export type ProactiveResult = "sent" | "sent_template" | "skipped_optout" | "skipped_no_template" | "failed";

/**
 * Envio iniciado pela empresa. Regras da plataforma:
 *  - respeita opt-out;
 *  - dentro de 24h da última mensagem do cliente: texto livre;
 *  - fora da janela: SOMENTE template aprovado (sem template configurado, não envia).
 */
export async function sendProactive(env: BotEnv, tenant: Tenant, contact: Contact, msg: ProactiveMessage, now: Date): Promise<ProactiveResult> {
  if (contact.opt_out) return "skipped_optout";
  const open = inServiceWindow(contact.last_inbound_at, now);
  if (!open && !msg.template) {
    env.log.warn("proativa_sem_template", { to: contact.wa_id });
    return "skipped_no_template";
  }
  try {
    const out = open ? { kind: "text" as const, body: msg.text } : { kind: "template" as const, ...msg.template! };
    const r = await env.wa.send(contact.wa_id, out, { phoneNumberId: tenant.phone_number_id ?? undefined });
    env.repo.logMessage({ tenantId: tenant.id, contactId: contact.id, direction: "out", waMessageId: r.id, type: out.kind, body: msg.text }, now);
    return open ? "sent" : "sent_template";
  } catch (e) {
    env.log.error("proativa_falhou", { to: contact.wa_id, erro: e instanceof Error ? e.message : String(e) });
    env.repo.logMessage({ tenantId: tenant.id, contactId: contact.id, direction: "out", type: "text", body: msg.text, status: "failed" }, now);
    return "failed";
  }
}
