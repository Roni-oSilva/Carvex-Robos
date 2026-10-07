import type { PromptTemplate } from "../types";

export interface ChapterVars {
  bookTitle: string;
  chapterTitle: string;
  chapterSummary?: string | null;
  audience?: string | null;
  tone?: string | null;
  outline?: string[];
}

export const chapterPrompt: PromptTemplate<ChapterVars> = {
  version: "chapter.v1",
  system:
    "Você é um autor experiente de e-books em português do Brasil. " +
    "Escreva em HTML simples (h2, h3, p, ul, ol, li, strong, em, blockquote), sem <html> nem <body>.",
  build: (v) => `Escreva o capítulo completo.

E-book: ${v.bookTitle}
Capítulo: ${v.chapterTitle}
Resumo esperado: ${v.chapterSummary ?? "—"}
Público-alvo: ${v.audience ?? "geral"}
Tom: ${v.tone ?? "didático e acessível"}
${v.outline?.length ? `Sumário do livro:\n${v.outline.map((t, i) => `${i + 1}. ${t}`).join("\n")}` : ""}

Inclua introdução, desenvolvimento com exemplos práticos e um fechamento com próximos passos.`,
};
