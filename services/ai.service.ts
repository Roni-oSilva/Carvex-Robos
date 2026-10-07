import "server-only";
import { AI_MODEL, estimateCost, getAnthropic } from "@/lib/ai/client";
import { createClient } from "@/lib/supabase/server";
import type { PromptTemplate } from "@/prompts/types";
import { outlinePrompt, type OutlineVars } from "@/prompts/ebook/outline";
import { chapterPrompt, type ChapterVars } from "@/prompts/ebook/chapter";
import { opportunityPrompt, type OpportunityVars } from "@/prompts/opportunity/analyze";
import { reviewPrompt } from "@/prompts/review/chapter";
import { salesPagePrompt, type SalesPageVars } from "@/prompts/marketing/sales-page";

interface RunOptions {
  type: string;
  bookId?: string | null;
  maxTokens?: number;
}

/** Executa um prompt, registra tokens/custo em ai_generations e devolve o texto. */
async function run<V>(template: PromptTemplate<V>, vars: V, opts: RunOptions): Promise<string> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const log = async (row: Record<string, unknown>) => {
    await supabase.from("ai_generations").insert({
      user_id: user.id,
      book_id: opts.bookId ?? null,
      generation_type: opts.type,
      model: AI_MODEL,
      prompt_version: template.version,
      ...row,
    });
  };

  try {
    const res = await getAnthropic().messages.create({
      model: AI_MODEL,
      max_tokens: opts.maxTokens ?? 4096,
      system: template.system,
      messages: [{ role: "user", content: template.build(vars) }],
    });
    const text = res.content.map((b) => (b.type === "text" ? b.text : "")).join("");
    await log({
      input_tokens: res.usage.input_tokens,
      output_tokens: res.usage.output_tokens,
      estimated_cost: estimateCost(res.usage.input_tokens, res.usage.output_tokens),
      status: "success",
    });
    return text;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro desconhecido";
    await log({ status: "error", error_message: message });
    throw e;
  }
}

function parseJson<T>(text: string): T {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("A IA não retornou JSON válido.");
  return JSON.parse(text.slice(start, end + 1)) as T;
}

export const aiService = {
  async generateOutline(vars: OutlineVars, bookId?: string) {
    const text = await run(outlinePrompt, vars, { type: "outline", bookId, maxTokens: 2048 });
    return parseJson<{ subtitle: string; chapters: { title: string; subtitle: string; summary: string }[] }>(text);
  },
  async generateChapter(vars: ChapterVars, bookId?: string) {
    return run(chapterPrompt, vars, { type: "chapter", bookId, maxTokens: 6000 });
  },
  async findOpportunities(vars: OpportunityVars) {
    const text = await run(opportunityPrompt, vars, { type: "opportunity", maxTokens: 3000 });
    return parseJson<{ opportunities: Record<string, unknown>[] }>(text).opportunities;
  },
  async reviewContent(content: string, tone?: string | null, bookId?: string) {
    const text = await run(reviewPrompt, { content, tone }, { type: "review", bookId, maxTokens: 6000 });
    return parseJson<{ score: number; issues: unknown[]; improved_content: string }>(text);
  },
  async generateSalesPage(vars: SalesPageVars, bookId?: string) {
    const text = await run(salesPagePrompt, vars, { type: "marketing", bookId, maxTokens: 2048 });
    return parseJson<Record<string, unknown>>(text);
  },
};
