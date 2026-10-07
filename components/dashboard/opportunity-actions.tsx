"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { convertOpportunityToEbook, deleteOpportunity, setOpportunityStatus } from "@/actions/opportunity.actions";
import { Button } from "@/components/ui/button";
import type { OpportunityStatus } from "@/types";

export function OpportunityActions({ id, status }: { id: string; status: OpportunityStatus }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const convert = () =>
    start(async () => {
      const res = await convertOpportunityToEbook(id);
      if (res.ok) router.push(`/ebooks/${res.data!.slug}/edit`);
      else setErr(res.error ?? "Erro.");
    });
  return (
    <div className="flex flex-wrap items-center gap-1">
      {status !== "transformada" && (
        <Button className="px-2 py-1 text-xs" disabled={pending} onClick={convert}>Virar e-book</Button>
      )}
      {status !== "aprovada" && (
        <Button variant="secondary" className="px-2 py-1 text-xs" disabled={pending} onClick={() => start(() => void setOpportunityStatus(id, "aprovada"))}>
          Aprovar
        </Button>
      )}
      {status !== "descartada" && (
        <Button variant="ghost" className="px-2 py-1 text-xs" disabled={pending} onClick={() => start(() => void setOpportunityStatus(id, "descartada"))}>
          Descartar
        </Button>
      )}
      <Button variant="ghost" className="px-2 py-1 text-xs" disabled={pending} onClick={() => start(() => void deleteOpportunity(id))}>
        Excluir
      </Button>
      {err && <span role="alert" className="text-xs text-red-600">{err}</span>}
    </div>
  );
}
