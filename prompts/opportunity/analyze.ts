import type { PromptTemplate } from "../types";

export interface OpportunityVars {
  niche: string;
  audience?: string | null;
}

export const opportunityPrompt: PromptTemplate<OpportunityVars> = {
  version: "opportunity.v1",
  system:
    "Você é um analista de mercado de infoprodutos no Brasil. " +
    "Responda SOMENTE com JSON válido, sem markdown nem texto extra.",
  build: (v) => `Sugira 5 oportunidades de e-book para o nicho abaixo.

Nicho: ${v.niche}
Público: ${v.audience ?? "aberto"}

Formato:
{"opportunities": [{"title": string, "description": string, "audience": string, "problem": string, "need": string, "trend": string, "interest_level": 0-100, "commercial_potential": 0-100, "difficulty": 0-100, "competition": "baixa"|"média"|"alta", "keywords": string[]}]}`,
};
