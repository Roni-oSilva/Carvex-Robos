import type { PromptTemplate } from "../types";

export interface SalesPageVars {
  title: string;
  subtitle?: string | null;
  audience?: string | null;
  objective?: string | null;
  chapters: string[];
}

export const salesPagePrompt: PromptTemplate<SalesPageVars> = {
  version: "sales-page.v1",
  system:
    "Você é um copywriter de resposta direta em português do Brasil. " +
    "Responda SOMENTE com JSON válido, sem markdown nem texto extra.",
  build: (v) => `Crie o conteúdo da página de vendas.

E-book: ${v.title}${v.subtitle ? ` — ${v.subtitle}` : ""}
Público: ${v.audience ?? "geral"}
Objetivo: ${v.objective ?? "—"}
Capítulos: ${v.chapters.join("; ")}

Formato:
{"headline": string, "subheadline": string, "benefits": string[], "faq": [{"q": string, "a": string}], "cta": string}`,
};
