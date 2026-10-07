import { createHmac, timingSafeEqual } from "node:crypto";
import type { InboundMessage, StatusUpdate } from "./types.ts";

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a), bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/** Valida X-Hub-Signature-256 = "sha256=" + HMAC_SHA256(corpo cru, App Secret). */
export function verifySignature(rawBody: Buffer, header: string | undefined, appSecret: string): boolean {
  if (!header || !appSecret) return false;
  const expected = "sha256=" + createHmac("sha256", appSecret).update(rawBody).digest("hex");
  return safeEqual(header, expected);
}

export function signBody(rawBody: Buffer | string, appSecret: string): string {
  return "sha256=" + createHmac("sha256", appSecret).update(rawBody).digest("hex");
}

/** GET de verificação: devolve o hub.challenge (texto puro) se o token confere; senão null. */
export function verifyChallenge(query: URLSearchParams, verifyToken: string): string | null {
  const mode = query.get("hub.mode"), token = query.get("hub.verify_token"), challenge = query.get("hub.challenge");
  if (mode !== "subscribe" || !token || !challenge || !verifyToken) return null;
  return safeEqual(token, verifyToken) ? challenge : null;
}

interface RawMessage {
  id?: string; from?: string; timestamp?: string; type?: string;
  text?: { body?: string };
  button?: { text?: string; payload?: string };
  interactive?: { type?: string; button_reply?: { id?: string; title?: string }; list_reply?: { id?: string; title?: string } };
  image?: { id?: string; caption?: string };
  document?: { id?: string; caption?: string };
  audio?: { id?: string };
  video?: { id?: string; caption?: string };
}

export interface ParsedWebhook { messages: InboundMessage[]; statuses: StatusUpdate[] }

/** Converte o payload da Cloud API em mensagens normalizadas. Ignora o que não entende (nunca lança). */
export function parseWebhook(payload: unknown): ParsedWebhook {
  const out: ParsedWebhook = { messages: [], statuses: [] };
  const p = payload as { object?: string; entry?: { changes?: { value?: Record<string, unknown> }[] }[] } | null;
  if (!p || p.object !== "whatsapp_business_account" || !Array.isArray(p.entry)) return out;

  for (const entry of p.entry) {
    for (const change of entry.changes ?? []) {
      const v = change.value as {
        metadata?: { phone_number_id?: string };
        contacts?: { wa_id?: string; profile?: { name?: string } }[];
        messages?: RawMessage[];
        statuses?: { id?: string; status?: string; recipient_id?: string; errors?: { code?: number }[] }[];
      } | undefined;
      if (!v) continue;
      const phoneNumberId = v.metadata?.phone_number_id ?? "";
      const names = new Map<string, string>();
      for (const c of v.contacts ?? []) if (c.wa_id && c.profile?.name) names.set(c.wa_id, c.profile.name);

      for (const m of v.messages ?? []) {
        if (!m.id || !m.from) continue;
        const msg: InboundMessage = {
          id: m.id, from: m.from, name: names.get(m.from), timestamp: Number(m.timestamp) || 0,
          type: "other", phoneNumberId,
        };
        if (m.type === "text") { msg.type = "text"; msg.text = m.text?.body ?? ""; }
        else if (m.type === "interactive" && m.interactive?.button_reply) {
          msg.type = "button"; msg.replyId = m.interactive.button_reply.id; msg.text = m.interactive.button_reply.title;
        } else if (m.type === "interactive" && m.interactive?.list_reply) {
          msg.type = "list"; msg.replyId = m.interactive.list_reply.id; msg.text = m.interactive.list_reply.title;
        } else if (m.type === "button") { msg.type = "button"; msg.replyId = m.button?.payload; msg.text = m.button?.text; }
        else if (m.type === "image") { msg.type = "image"; msg.mediaId = m.image?.id; msg.text = m.image?.caption; }
        else if (m.type === "document") { msg.type = "document"; msg.mediaId = m.document?.id; msg.text = m.document?.caption; }
        else if (m.type === "audio") { msg.type = "audio"; msg.mediaId = m.audio?.id; }
        else if (m.type === "video") { msg.type = "video"; msg.mediaId = m.video?.id; msg.text = m.video?.caption; }
        else if (m.type === "location") { msg.type = "location"; }
        out.messages.push(msg);
      }

      for (const s of v.statuses ?? []) {
        if (!s.id) continue;
        const status = (["sent", "delivered", "read", "failed"] as const).find((x) => x === s.status) ?? "other";
        out.statuses.push({ id: s.id, status, recipient: s.recipient_id ?? "", phoneNumberId, errorCode: s.errors?.[0]?.code });
      }
    }
  }
  return out;
}
