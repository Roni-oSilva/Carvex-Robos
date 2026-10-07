"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createVersion, uploadCover } from "@/actions/library.actions";
import { Button } from "@/components/ui/button";

export function LibraryActions({ bookId, slug }: { bookId: string; slug: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [summary, setSummary] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const finish = (ok: boolean, error?: string, okMsg = "Concluído.") => {
    setMsg(ok ? okMsg : error ?? "Erro.");
    if (ok) router.refresh();
  };

  return (
    <div className="mt-3 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" aria-label="Capa" className="text-xs" />
        <Button
          variant="secondary"
          disabled={pending}
          onClick={() => {
            const f = fileRef.current?.files?.[0];
            if (!f) return setMsg("Selecione uma imagem.");
            const fd = new FormData();
            fd.set("file", f);
            start(async () => {
              const res = await uploadCover(bookId, fd);
              finish(res.ok, res.error, "Capa atualizada.");
            });
          }}
        >
          Enviar capa
        </Button>
        <a href={`/api/export/${slug}`} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100">
          Baixar HTML
        </a>
      </div>
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            const res = await createVersion(bookId, summary);
            finish(res.ok, res.error, "Versão criada.");
            if (res.ok) setSummary("");
          });
        }}
      >
        <input
          aria-label="O que mudou"
          placeholder="O que mudou nesta versão?"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="min-w-[220px] flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <Button type="submit" disabled={pending}>Criar versão</Button>
      </form>
      {msg && <p role="status" className="text-xs text-slate-600">{msg}</p>}
    </div>
  );
}
