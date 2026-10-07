"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { discoverOpportunities } from "@/actions/ai.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function DiscoverForm() {
  const router = useRouter();
  const [niche, setNiche] = useState("");
  const [audience, setAudience] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      setMsg("Analisando mercado…");
      const res = await discoverOpportunities({ niche, audience: audience || undefined });
      setMsg(res.ok ? `${res.data!.count} oportunidades adicionadas.` : res.error ?? "Erro.");
      if (res.ok) router.refresh();
    });
  };

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
      <div className="min-w-[200px] flex-1"><Input label="Nicho" value={niche} onChange={(e) => setNiche(e.target.value)} required /></div>
      <div className="min-w-[200px] flex-1"><Input label="Público (opcional)" value={audience} onChange={(e) => setAudience(e.target.value)} /></div>
      <Button type="submit" disabled={pending || niche.trim().length < 2}>Descobrir com IA</Button>
      {msg && <span role="status" className="w-full text-sm text-slate-600">{msg}</span>}
    </form>
  );
}
