import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PublicPathPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: path } = await supabase
    .from("learning_paths")
    .select("id,title,description")
    .eq("slug", params.slug)
    .eq("status", "PUBLISHED")
    .maybeSingle();
  if (!path) notFound();

  const { data: modules } = await supabase
    .from("learning_path_modules")
    .select("id,title,description,learning_path_items(id,title,item_type,order_index)")
    .eq("path_id", path.id)
    .order("order_index");

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl font-bold">{path.title}</h1>
      {path.description && <p className="mt-2 text-slate-600">{path.description}</p>}
      <ol className="mt-8 space-y-6">
        {modules?.map((m) => (
          <li key={m.id} className="rounded-lg border bg-white p-4">
            <h2 className="font-semibold">{m.title}</h2>
            {m.description && <p className="text-sm text-slate-600">{m.description}</p>}
            <ul className="mt-2 list-disc pl-5 text-sm">
              {[...(m.learning_path_items ?? [])].sort((a, b) => a.order_index - b.order_index).map((i) => (
                <li key={i.id}>{i.title} <span className="text-slate-400">({i.item_type})</span></li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </main>
  );
}
