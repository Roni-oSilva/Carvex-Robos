import type { PromptTemplate } from "../types";

export interface OutlineVars {
  title: string;
  theme?: string | null;
  objective?: string | null;
  audience?: string | null;
  level?: string | null;
  tone?: string | null;
  chapters?: number;
}

export const outlinePrompt: PromptTemplate<OutlineVars> = {
  version: "outline.v1",
  system:
    "Você é um editor-chefe especialista em e-books educacionais em português do Brasil. " +
    "Responda SOMENTE com JSON válido, sem markdown nem texto extra.",
  build: (v) => `Crie o sumário de um e-book.

Título: ${v.title}
Tema: ${v.theme ?? "livre"}
Objetivo: ${v.objective ?? "não informado"}
Público-alvo: ${v.audience ?? "geral"}
Nível: ${v.level ?? "iniciante"}
Tom: ${v.tone ?? "didático e acessível"}
Número de capítulos: ${v.chapters ?? 8}

Formato:
{"subtitle": string, "chapters": [{"title": string, "subtitle": string, "summary": string}]}`,
};
