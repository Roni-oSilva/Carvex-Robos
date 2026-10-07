import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = createClient();
  const count = (table: string, filter?: [string, string]) => {
    const q = supabase.from(table).select("*", { count: "exact", head: true });
    return (filter ? q.eq(filter[0], filter[1]) : q).then((r) => r.count ?? 0);
  };
  const [books, published, opps, gens] = await Promise.all([
    count("books"),
    count("books", ["status", "PUBLISHED"]),
    count("opportunities", ["status", "nova"]),
    supabase.from("ai_generations").select("estimated_cost").then((r) =>
      (r.data ?? []).reduce((s, g) => s + Number(g.estimated_cost ?? 0), 0),
    ),
  ]);

  const cards = [
    ["E-books", books, "/ebooks"],
    ["Publicados", published, "/ebooks"],
    ["Oportunidades novas", opps, "/radar"],
    ["Custo de IA (US$)", gens.toFixed(2), "/analytics"],
  ] as const;

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, value, href]) => (
          <Link key={label} href={href} className="rounded-lg border bg-white p-4 hover:border-brand-500">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-1 text-3xl font-bold">{value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
