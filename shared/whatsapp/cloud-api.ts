import { clip } from "../utils/text.ts";
import type { Outgoing, WhatsAppClient } from "./types.ts";
import { WhatsAppError } from "./types.ts";

export interface CloudApiOptions {
  token: string;
  phoneNumberId: string;
  apiVersion?: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
  maxRetries?: number;
}

/** Monta o corpo JSON da Cloud API respeitando os limites do WhatsApp (botões, listas, textos). */
export function buildPayload(to: string, msg: Outgoing): Record<string, unknown> {
  const base = { messaging_product: "whatsapp", recipient_type: "individual", to };
  switch (msg.kind) {
    case "text":
      return { ...base, type: "text", text: { preview_url: false, body: clip(msg.body, 4096) } };
    case "buttons":
      return {
        ...base, type: "interactive",
        interactive: {
          type: "button", body: { text: clip(msg.body, 1024) },
          action: { buttons: msg.buttons.slice(0, 3).map((b) => ({ type: "reply", reply: { id: clip(b.id, 256), title: clip(b.title, 20) } })) },
        },
      };
    case "list":
      return {
        ...base, type: "interactive",
        interactive: {
          type: "list", body: { text: clip(msg.body, 1024) },
          action: {
            button: clip(msg.button, 20),
            sections: [{
              title: clip(msg.sectionTitle ?? "Opções", 24),
              rows: msg.rows.slice(0, 10).map((r) => ({ id: clip(r.id, 200), title: clip(r.title, 24), ...(r.description ? { description: clip(r.description, 72) } : {}) })),
            }],
          },
        },
      };
    case "template":
      return {
        ...base, type: "template",
        template: {
          name: msg.name, language: { code: msg.language },
          ...(msg.params.length ? { components: [{ type: "body", parameters: msg.params.map((t) => ({ type: "text", text: clip(t, 1000) })) }] } : {}),
        },
      };
  }
}

export class CloudApiClient implements WhatsAppClient {
  private o: Required<Omit<CloudApiOptions, "sleep" | "fetchImpl">> & { sleep: (ms: number) => Promise<void>; fetchImpl: typeof fetch };

  constructor(opts: CloudApiOptions) {
    if (!opts.token) throw new Error("WHATSAPP_TOKEN ausente.");
    this.o = {
      apiVersion: "v21.0", baseUrl: "https://graph.facebook.com", maxRetries: 2,
      sleep: (ms) => new Promise((r) => setTimeout(r, ms)), fetchImpl: fetch, ...opts,
    };
  }

  private async post(phoneNumberId: string, body: Record<string, unknown>): Promise<{ id: string }> {
    const url = `${this.o.baseUrl}/${this.o.apiVersion}/${phoneNumberId}/messages`;
    let lastErr: WhatsAppError | null = null;
    for (let attempt = 0; attempt <= this.o.maxRetries; attempt++) {
      const res = await this.o.fetchImpl(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${this.o.token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => ({}))) as { messages?: { id: string }[]; error?: { message?: string; code?: number } };
      if (res.ok) return { id: data.messages?.[0]?.id ?? "" };
      lastErr = new WhatsAppError(data.error?.message ?? `HTTP ${res.status}`, res.status, data.error?.code);
      if (!lastErr.retryable || attempt === this.o.maxRetries) break;
      await this.o.sleep(500 * 2 ** attempt);
    }
    throw lastErr!;
  }

  send(to: string, msg: Outgoing, opts?: { phoneNumberId?: string }): Promise<{ id: string }> {
    return this.post(opts?.phoneNumberId ?? this.o.phoneNumberId, buildPayload(to, msg));
  }

  async markRead(messageId: string, opts?: { phoneNumberId?: string }): Promise<void> {
    await this.post(opts?.phoneNumberId ?? this.o.phoneNumberId, { messaging_product: "whatsapp", status: "read", message_id: messageId });
  }
}

/** Cliente em memória para testes e demonstrações — não envia nada à rede. */
export class FakeWhatsApp implements WhatsAppClient {
  sent: { to: string; msg: Outgoing; id: string }[] = [];
  failNext = 0;
  private n = 0;

  async send(to: string, msg: Outgoing): Promise<{ id: string }> {
    if (this.failNext > 0) {
      this.failNext--;
      throw new WhatsAppError("falha simulada", 500);
    }
    const id = `wamid.FAKE${++this.n}`;
    this.sent.push({ to, msg, id });
    return { id };
  }

  /** Textos enviados a um número (útil nas asserções). */
  texts(to?: string): string[] {
    return this.sent.filter((s) => !to || s.to === to).map((s) => {
      const m = s.msg;
      if (m.kind === "template") return `[template:${m.name}] ${m.params.join(" | ")}`;
      if (m.kind === "buttons") return `${m.body}\n[${m.buttons.map((b) => b.title).join("] [")}]`;
      if (m.kind === "list") return `${m.body}\n${m.rows.map((r) => `• ${r.title}`).join("\n")}`;
      return m.body;
    });
  }
}
