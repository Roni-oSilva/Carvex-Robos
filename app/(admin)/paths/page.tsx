import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Trilhas" };
export const dynamic = "force-dynamic";

export default async function PathsPage() {
  const { data } = await createClient()
    .from("learning_paths")
    .select("id,title,slug,status,learning_path_modules(count)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Trilhas de Aprendizagem</h1>
        <Link href="/paths/new" className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          Nova trilha
        </Link>
      </div>
      <ul className="mt-6 divide-y rounded-lg border bg-white">
        {data?.map((p) => (
          <li key={p.id} className="flex items-center justify-between p-4">
            <div>
              <Link href={`/paths/${p.slug}/edit`} className="font-medium hover:underline">{p.title}</Link>
              <p className="text-xs text-slate-500">{p.learning_path_modules?.[0]?.count ?? 0} módulos</p>
            </div>
            <StatusBadge status={p.status} />
          </li>
        ))}
        {!data?.length && <li className="p-6 text-sm text-slate-500">Nenhuma trilha ainda.</li>}
      </ul>
    </div>
  );
}
