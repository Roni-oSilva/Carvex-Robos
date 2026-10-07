export interface AiRequest { system: string; user: string; maxTokens?: number }

export interface AiProvider {
  complete(req: AiRequest): Promise<string>;
}

export class AiError extends Error {}

export interface AnthropicOptions {
  apiKey: string;
  model: string;
  fetchImpl?: typeof fetch;
  baseUrl?: string;
  timeoutMs?: number;
}

/** Provedor Anthropic via HTTP puro (sem SDK). A chave vem SEMPRE de variável de ambiente. */
export class AnthropicProvider implements AiProvider {
  private o: Required<AnthropicOptions>;

  constructor(opts: AnthropicOptions) {
    if (!opts.apiKey) throw new AiError("AI_API_KEY ausente.");
    this.o = { fetchImpl: fetch, baseUrl: "https://api.anthropic.com", timeoutMs: 15_000, ...opts };
  }

  async complete(req: AiRequest): Promise<string> {
    const res = await this.o.fetchImpl(`${this.o.baseUrl}/v1/messages`, {
      method: "POST",
      headers: { "x-api-key": this.o.apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: this.o.model, max_tokens: req.maxTokens ?? 500, system: req.system,
        messages: [{ role: "user", content: req.user }],
      }),
      signal: AbortSignal.timeout(this.o.timeoutMs),
    });
    const data = (await res.json().catch(() => ({}))) as { content?: { type: string; text?: string }[]; error?: { message?: string } };
    if (!res.ok) throw new AiError(data.error?.message ?? `HTTP ${res.status}`);
    return (data.content ?? []).map((b) => (b.type === "text" ? b.text ?? "" : "")).join("");
  }
}

/** Provedor de teste: responde com uma função (ou lista de respostas). */
export class FakeAi implements AiProvider {
  calls: AiRequest[] = [];
  private responder: (req: AiRequest) => string;
  constructor(responder: string | ((req: AiRequest) => string)) {
    this.responder = typeof responder === "string" ? () => responder : responder;
  }
  async complete(req: AiRequest): Promise<string> {
    this.calls.push(req);
    return this.responder(req);
  }
}
