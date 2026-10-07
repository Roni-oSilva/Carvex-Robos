"use client";

import { useTransition } from "react";
import { deleteOpportunity, setOpportunityStatus } from "@/actions/opportunity.actions";
import { Button } from "@/components/ui/button";
import type { OpportunityStatus } from "@/types";

export function OpportunityActions({ id, status }: { id: string; status: OpportunityStatus }) {
  const [pending, start] = useTransition();
  return (
    <div className="flex gap-1">
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
    </div>
  );
}
