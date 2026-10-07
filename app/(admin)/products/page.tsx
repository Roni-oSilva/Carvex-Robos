import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Produtos" };
export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const { data } = await createClient()
    .from("books")
    .select("id,title,slug,status,sales_page_content")
    .order("updated_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold">Produtos</h1>
      <p className="mt-1 text-sm text-slate-600">Página de vendas de cada e-book.</p>
      <ul className="mt-6 divide-y rounded-lg border bg-white">
        {data?.map((b) => (
          <li key={b.id} className="flex items-center justify-between p-4">
            <div>
              <Link href={`/products/${b.slug}`} className="font-medium hover:underline">{b.title}</Link>
              <p className="text-xs text-slate-500">{b.sales_page_content ? "Página de vendas criada" : "Sem página de vendas"}</p>
            </div>
            <StatusBadge status={b.status} />
          </li>
        ))}
        {!data?.length && <li className="p-6 text-sm text-slate-500">Nenhum e-book ainda.</li>}
      </ul>
    </div>
  );
}
