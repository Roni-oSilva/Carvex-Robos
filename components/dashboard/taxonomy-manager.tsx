"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  title: string;
  items: { id: string; name: string }[];
  onAdd: (name: string) => Promise<{ ok: boolean; error?: string }>;
  onDelete: (id: string) => Promise<{ ok: boolean; error?: string }>;
}

export function TaxonomyManager({ title, items, onAdd, onDelete }: Props) {
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      const res = await onAdd(name);
      setErr(res.ok ? null : res.error ?? "Erro.");
      if (res.ok) setName("");
    });
  };

  return (
    <section className="rounded-lg border bg-white p-4">
      <h2 className="font-semibold">{title}</h2>
      <form onSubmit={submit} className="mt-3 flex gap-2">
        <input
          aria-label={`Novo item de ${title}`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <Button type="submit" disabled={pending || name.trim().length < 2}>Adicionar</Button>
      </form>
      {err && <p role="alert" className="mt-1 text-xs text-red-600">{err}</p>}
      <ul className="mt-3 divide-y text-sm">
        {items.map((i) => (
          <li key={i.id} className="flex items-center justify-between py-2">
            {i.name}
            <Button variant="ghost" className="px-2 py-1 text-xs" disabled={pending} onClick={() => start(async () => { await onDelete(i.id); })}>
              Remover
            </Button>
          </li>
        ))}
        {!items.length && <li className="py-2 text-slate-500">Nada ainda.</li>}
      </ul>
    </section>
  );
}
