"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateChapter, deleteChapter } from "@/actions/chapter.actions";
import { generateChapterContent } from "@/actions/ai.actions";
import { Button } from "@/components/ui/button";
import { RichEditor } from "./rich-editor";
import type { BookChapter } from "@/types";

export function ChapterEditor({ chapter }: { chapter: BookChapter }) {
  const router = useRouter();
  const [title, setTitle] = useState(chapter.title);
  const [content, setContent] = useState(chapter.content ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const save = () =>
    start(async () => {
      const res = await updateChapter(chapter.id, { title, content });
      setMsg(res.ok ? "Salvo." : res.error ?? "Erro ao salvar.");
    });

  const generate = () =>
    start(async () => {
      setMsg("Gerando com IA…");
      const res = await generateChapterContent(chapter.id);
      if (res.ok && res.data) {
        setContent(res.data.content);
        setMsg("Capítulo gerado e salvo.");
      } else setMsg(res.error ?? "Erro ao gerar.");
    });

  const remove = () => {
    if (!confirm(`Excluir o capítulo "${chapter.title}"?`)) return;
    start(async () => {
      const res = await deleteChapter(chapter.id);
      if (res.ok) router.refresh();
      else setMsg(res.error ?? "Erro ao excluir.");
    });
  };

  return (
    <section className="rounded-lg border bg-white p-4">
      <input
        aria-label="Título do capítulo"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2 text-lg font-semibold"
      />
      <RichEditor value={content} onChange={setContent} />
      <div className="mt-3 flex items-center gap-2">
        <Button onClick={save} disabled={pending}>Salvar</Button>
        <Button variant="secondary" onClick={generate} disabled={pending}>Gerar com IA</Button>
        <Button variant="ghost" onClick={remove} disabled={pending}>Excluir</Button>
        {msg && <span role="status" className="text-sm text-slate-600">{msg}</span>}
      </div>
    </section>
  );
}
