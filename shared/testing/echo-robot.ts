import { h } from "../dashboard/html.ts";
import { answerFromKnowledge, type KnowledgeBase } from "../ai/knowledge.ts";
import { requestHandoff } from "../engine/engine.ts";
import type { Robot } from "../engine/types.ts";

export interface EchoSettings { empresa: { nome: string }; faq: KnowledgeBase["faq"]; mensagens?: { handoff?: string } }

/** Robô mínimo usado só nos testes do motor compartilhado. */
export const echoRobot: Robot<EchoSettings> = {
  id: "echo", nome: "Robô Eco", version: "0.0.1",
  migrations: [],
  defaultSettings: () => ({ empresa: { nome: "Empresa Teste" }, faq: [{ pergunta: "Qual o horário de funcionamento?", resposta: "Das 9h às 18h." }] }),
  validateSettings(raw) {
    const r = raw as EchoSettings | null;
    if (!r || typeof r.empresa?.nome !== "string" || !Array.isArray(r.faq)) return { ok: false, error: "empresa.nome e faq são obrigatórios." };
    return { ok: true, value: r };
  },
  knowledge: (s) => ({ empresa: { nome: s.empresa.nome }, faq: s.faq }),
  async handle(ctx, msg) {
    const t = msg.text ?? "";
    if (t === "explodir") throw new Error("falha de teste");
    if (t === "ajuda") return requestHandoff(ctx, "teste");
    const a = await answerFromKnowledge(this.knowledge(ctx.settings), t, ctx.env.ai);
    if (!a.found) return requestHandoff(ctx, "sem resposta", a.answer);
    return [{ kind: "text", body: a.answer }];
  },
  admin: { nav: [], home: (ctx) => h`<h1>Olá ${ctx.tenant.nome}</h1>`, routes: [] },
};
