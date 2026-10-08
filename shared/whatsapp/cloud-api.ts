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

/** A Meta rejeita quebras de linha, tabs e 4+ espaços seguidos em parâmetros de template. */
export function templateParam(t: string): string {
  return t.replace(/[\r\n\t]+/g, " | ").replace(/ {4,}/g, "   ").trim() || "-";
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
          ...(msg.params.length ? { components: [{ type: "body", parameters: msg.params.map((t) => ({ type: "text", text: clip(templateParam(t), 1000) })) }] } : {}),
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

  /**
   * Baixa mídia em 2 passos (documentação da Cloud API): GET /{media-id} devolve uma URL temporária;
   * GET nessa URL, com o mesmo token, devolve o arquivo. Limite de 5 MB conferido antes e depois.
   */
  async downloadMedia(mediaId: string): Promise<{ data: Buffer; mime: string }> {
    if (!/^[A-Za-z0-9_-]{1,100}$/.test(mediaId)) throw new WhatsAppError("id de mídia inválido", 400);
    const auth = { Authorization: `Bearer ${this.o.token}` };
    const meta = await this.o.fetchImpl(`${this.o.baseUrl}/${this.o.apiVersion}/${mediaId}`, { headers: auth });
    const info = (await meta.json().catch(() => ({}))) as { url?: string; mime_type?: string; file_size?: number; error?: { message?: string; code?: number } };
    if (!meta.ok || !info.url) throw new WhatsAppError(info.error?.message ?? `HTTP ${meta.status}`, meta.status, info.error?.code);
    if ((info.file_size ?? 0) > 5 * 1024 * 1024) throw new WhatsAppError("mídia maior que 5 MB", 413);
    const file = await this.o.fetchImpl(info.url, { headers: auth });
    if (!file.ok) throw new WhatsAppError(`HTTP ${file.status} ao baixar a mídia`, file.status);
    const data = Buffer.from(await file.arrayBuffer());
    if (data.length > 5 * 1024 * 1024) throw new WhatsAppError("mídia maior que 5 MB", 413);
    return { data, mime: info.mime_type ?? file.headers.get("content-type") ?? "application/octet-stream" };
  }

  async markRead(messageId: string, opts?: { phoneNumberId?: string }): Promise<void> {
    await this.post(opts?.phoneNumberId ?? this.o.phoneNumberId, { messaging_product: "whatsapp", status: "read", message_id: messageId });
  }
}

/** Cliente em memória para testes e demonstrações — não envia nada à rede. */
export class FakeWhatsApp implements WhatsAppClient {
  /** Mídias "recebidas" nos testes: id -> arquivo. */
  media = new Map<string, { data: Buffer; mime: string }>();
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

  async downloadMedia(mediaId: string): Promise<{ data: Buffer; mime: string }> {
    const m = this.media.get(mediaId);
    if (!m) throw new WhatsAppError("mídia não encontrada", 404);
    return m;
  }

  /** Textos enviados a um número (útil nas asserções). */
  texts(to?: string): string[] {
    return FakeWhatsApp.format(this.sent.filter((s) => !to || s.to === to));
  }

  static format(entries: { msg: Outgoing }[]): string[] {
    return entries.map(({ msg: m }) => {
      if (m.kind === "template") return `[template:${m.name}] ${m.params.join(" | ")}`;
      if (m.kind === "buttons") return `${m.body}\n[${m.buttons.map((b) => b.title).join("] [")}]`;
      if (m.kind === "list") return `${m.body}\n${m.rows.map((r) => `• ${r.title}`).join("\n")}`;
      return m.body;
    });
  }
}
