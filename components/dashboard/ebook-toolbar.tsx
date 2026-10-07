"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { generateEbookOutline, generateSalesPage } from "@/actions/ai.actions";
import { addChapter } from "@/actions/chapter.actions";
import { setEbookStatus } from "@/actions/ebook.actions";
import { Button } from "@/components/ui/button";
import type { Book } from "@/types";

export function EbookToolbar({ book, hasChapters }: { book: Book; hasChapters: boolean }) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const run = (label: string, fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => {
      setMsg(`${label}…`);
      const res = await fn();
      setMsg(res.ok ? "Concluído." : res.error ?? "Erro.");
      router.refresh();
    });

  const published = book.status === "PUBLISHED";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        disabled={pending}
        onClick={() => {
          if (hasChapters && !confirm("Isso substitui todos os capítulos atuais. Continuar?")) return;
          run("Gerando sumário", () => generateEbookOutline(book.id));
        }}
      >
        Gerar sumário com IA
      </Button>
      <Button variant="secondary" disabled={pending} onClick={() => run("Adicionando", () => addChapter(book.id, "Novo capítulo"))}>
        Adicionar capítulo
      </Button>
      <Button variant="secondary" disabled={pending || !hasChapters} onClick={() => run("Gerando página de vendas", () => generateSalesPage(book.id))}>
        Página de vendas (IA)
      </Button>
      <Button
        variant={published ? "secondary" : "primary"}
        disabled={pending}
        onClick={() => run(published ? "Despublicando" : "Publicando", () => setEbookStatus(book.id, published ? "DRAFT" : "PUBLISHED"))}
      >
        {published ? "Despublicar" : "Publicar"}
      </Button>
      {msg && <span role="status" className="text-sm text-slate-600">{msg}</span>}
    </div>
  );
}
