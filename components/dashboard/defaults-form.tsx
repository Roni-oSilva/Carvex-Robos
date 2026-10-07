"use client";

import { useState, useTransition } from "react";
import { saveDefaults } from "@/actions/taxonomy.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Defaults { default_author: string; default_tone: string; default_level: string }

export function DefaultsForm({ initial }: { initial: Partial<Defaults> }) {
  const [v, setV] = useState<Defaults>({
    default_author: initial.default_author ?? "",
    default_tone: initial.default_tone ?? "",
    default_level: initial.default_level ?? "",
  });
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const set = (k: keyof Defaults) => (e: React.ChangeEvent<HTMLInputElement>) => setV({ ...v, [k]: e.target.value });

  return (
    <form
      className="space-y-3 rounded-lg border bg-white p-4"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await saveDefaults(v);
          setMsg(res.ok ? "Salvo." : res.error ?? "Erro.");
        });
      }}
    >
      <h2 className="font-semibold">Padrões para novos e-books</h2>
      <Input label="Autor" value={v.default_author} onChange={set("default_author")} />
      <Input label="Tom de voz" value={v.default_tone} onChange={set("default_tone")} />
      <Input label="Nível" value={v.default_level} onChange={set("default_level")} />
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>Salvar</Button>
        {msg && <span role="status" className="text-sm text-slate-600">{msg}</span>}
      </div>
    </form>
  );
}
