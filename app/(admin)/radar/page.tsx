import { DiscoverForm } from "@/components/dashboard/discover-form";
import { OpportunityActions } from "@/components/dashboard/opportunity-actions";
import { createClient } from "@/lib/supabase/server";
import type { Opportunity } from "@/types";

export const metadata = { title: "Radar de Oportunidades" };

export default async function RadarPage() {
  const { data } = await createClient().from("opportunities").select("*").order("created_at", { ascending: false });
  const items = (data ?? []) as Opportunity[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Radar de Oportunidades</h1>
      <DiscoverForm />
      <ul className="space-y-3">
        {items.map((o) => (
          <li key={o.id} className="rounded-lg border bg-white p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold">{o.title}</h2>
                <p className="text-sm text-slate-600">{o.description}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{o.status}</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Interesse {o.interest_level} · Potencial {o.commercial_potential} · Dificuldade {o.difficulty}
              {o.competition && ` · Concorrência ${o.competition}`}
            </p>
            <div className="mt-3"><OpportunityActions id={o.id} status={o.status} /></div>
          </li>
        ))}
        {!items.length && <li className="text-sm text-slate-500">Nenhuma oportunidade ainda.</li>}
      </ul>
    </div>
  );
}
