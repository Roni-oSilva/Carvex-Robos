import type { PromptTemplate } from "../types";

export const reviewPrompt: PromptTemplate<{ content: string; tone?: string | null }> = {
  version: "review.v1",
  system:
    "Você é um revisor editorial rigoroso em português do Brasil. " +
    "Responda SOMENTE com JSON válido, sem markdown nem texto extra.",
  build: (v) => `Revise o texto abaixo (clareza, gramática, coerência, tom: ${v.tone ?? "didático"}).

Formato:
{"score": 0-10, "issues": [{"type": string, "excerpt": string, "suggestion": string}], "improved_content": string}

TEXTO:
${v.content}`,
};
