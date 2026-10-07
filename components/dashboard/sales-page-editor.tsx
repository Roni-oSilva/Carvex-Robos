"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { generateSalesPage } from "@/actions/ai.actions";
import { saveSalesPage } from "@/actions/ebook.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface SalesContent {
  headline: string;
  subheadline: string;
  benefits: string[];
  faq: { q: string; a: string }[];
  cta: string;
}

const empty: SalesContent = { headline: "", subheadline: "", benefits: [], faq: [], cta: "" };

export function SalesPageEditor({ bookId, initial }: { bookId: string; initial: Partial<SalesContent> | null }) {
  const router = useRouter();
  const [c, setC] = useState<SalesContent>({ ...empty, ...initial });
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const text = (k: "headline" | "subheadline" | "cta") => (e: React.ChangeEvent<HTMLInputElement>) => setC({ ...c, [k]: e.target.value });

  return (
    <div className="max-w-2xl space-y-4">
      <Input label="Headline" value={c.headline} onChange={text("headline")} />
      <Input label="Subheadline" value={c.subheadline} onChange={text("subheadline")} />
      <div>
        <label htmlFor="benefits" className="mb-1 block text-sm font-medium">Benefícios (um por linha)</label>
        <textarea
          id="benefits"
          rows={5}
          value={c.benefits.join("\n")}
          onChange={(e) => setC({ ...c, benefits: e.target.value.split("\n") })}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <Input label="Chamada para ação (CTA)" value={c.cta} onChange={text("cta")} />
      <div>
        <p className="mb-1 text-sm font-medium">Perguntas frequentes</p>
        {c.faq.map((f, i) => (
          <div key={i} className="mb-2 rounded-md border bg-white p-3 text-sm">
            <input aria-label={`Pergunta ${i + 1}`} value={f.q} onChange={(e) => setC({ ...c, faq: c.faq.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)) })} className="w-full border-b px-1 py-1 font-medium" />
            <textarea aria-label={`Resposta ${i + 1}`} rows={2} value={f.a} onChange={(e) => setC({ ...c, faq: c.faq.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)) })} className="mt-1 w-full px-1 py-1" />
            <button type="button" className="text-xs text-red-600" onClick={() => setC({ ...c, faq: c.faq.filter((_, j) => j !== i) })}>remover</button>
          </div>
        ))}
        <Button variant="secondary" onClick={() => setC({ ...c, faq: [...c.faq, { q: "", a: "" }] })}>Adicionar pergunta</Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          disabled={pending}
          onClick={() =>
            start(async () => {
              const clean = { ...c, benefits: c.benefits.map((b) => b.trim()).filter(Boolean), faq: c.faq.filter((f) => f.q.trim()) };
              const res = await saveSalesPage(bookId, clean);
              setMsg(res.ok ? "Salvo." : res.error ?? "Erro.");
            })
          }
        >
          Salvar
        </Button>
        <Button
          variant="secondary"
          disabled={pending}
          onClick={() => {
            if (c.headline && !confirm("Substituir o conteúdo atual pela versão gerada?")) return;
            start(async () => {
              setMsg("Gerando com IA…");
              const res = await generateSalesPage(bookId);
              setMsg(res.ok ? "Gerado." : res.error ?? "Erro.");
              if (res.ok) router.refresh();
            });
          }}
        >
          Gerar com IA
        </Button>
        {msg && <span role="status" className="text-sm text-slate-600">{msg}</span>}
      </div>
    </div>
  );
}
