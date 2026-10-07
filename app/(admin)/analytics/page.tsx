import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Analytics" };
export const dynamic = "force-dynamic";

interface Gen {
  generation_type: string;
  status: string;
  input_tokens: number | null;
  output_tokens: number | null;
  estimated_cost: number | null;
  error_message: string | null;
  created_at: string;
}

export default async function AnalyticsPage() {
  const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const { data } = await createClient()
    .from("ai_generations")
    .select("generation_type,status,input_tokens,output_tokens,estimated_cost,error_message,created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(5000);
  const gens = (data ?? []) as Gen[];

  const ok = gens.filter((g) => g.status === "success");
  const cost = ok.reduce((s, g) => s + Number(g.estimated_cost ?? 0), 0);
  const tokens = ok.reduce((s, g) => s + (g.input_tokens ?? 0) + (g.output_tokens ?? 0), 0);

  const byType = new Map<string, { n: number; cost: number }>();
  for (const g of ok) {
    const cur = byType.get(g.generation_type) ?? { n: 0, cost: 0 };
    byType.set(g.generation_type, { n: cur.n + 1, cost: cur.cost + Number(g.estimated_cost ?? 0) });
  }
  const rows = [...byType.entries()].sort((a, b) => b[1].cost - a[1].cost);
  const maxCost = Math.max(...rows.map(([, v]) => v.cost), 0.0001);
  const errors = gens.filter((g) => g.status === "error").slice(0, 10);

  const cards = [
    ["Gerações (30 dias)", ok.length],
    ["Tokens", tokens.toLocaleString("pt-BR")],
    ["Custo estimado (US$)", cost.toFixed(2)],
    ["Erros", gens.length - ok.length],
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics de IA</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([l, v]) => (
          <div key={l} className="rounded-lg border bg-white p-4">
            <p className="text-sm text-slate-500">{l}</p>
            <p className="mt-1 text-3xl font-bold">{v}</p>
          </div>
        ))}
      </div>

      <section className="max-w-2xl rounded-lg border bg-white p-4">
        <h2 className="mb-3 font-semibold">Custo por tipo</h2>
        <ul className="space-y-2 text-sm">
          {rows.map(([type, v]) => (
            <li key={type}>
              <div className="flex justify-between"><span>{type} <span className="text-slate-400">({v.n})</span></span><span>US$ {v.cost.toFixed(4)}</span></div>
              <div className="mt-1 h-2 rounded bg-slate-100"><div className="h-2 rounded bg-brand-500" style={{ width: `${(v.cost / maxCost) * 100}%` }} /></div>
            </li>
          ))}
          {!rows.length && <li className="text-slate-500">Sem gerações no período.</li>}
        </ul>
      </section>

      {errors.length > 0 && (
        <section className="max-w-2xl rounded-lg border bg-white p-4">
          <h2 className="mb-3 font-semibold">Últimos erros</h2>
          <ul className="space-y-2 text-sm">
            {errors.map((e, i) => (
              <li key={i}>
                <span className="text-slate-500">{new Date(e.created_at).toLocaleString("pt-BR")} · {e.generation_type}</span>
                <p className="text-red-700">{e.error_message}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
