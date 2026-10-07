import { notFound } from "next/navigation";
import Link from "next/link";
import { PathInfoForm } from "@/components/dashboard/path-info-form";
import { PathBuilder } from "@/components/dashboard/path-builder";
import { StatusBadge } from "@/components/shared/status-badge";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function EditPathPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: path } = await supabase.from("learning_paths").select("*").eq("slug", params.slug).maybeSingle();
  if (!path) notFound();

  const [{ data: modules }, { data: books }] = await Promise.all([
    supabase
      .from("learning_path_modules")
      .select("id,title,description,learning_path_items(id,title,item_type,order_index)")
      .eq("path_id", path.id)
      .order("order_index"),
    supabase.from("books").select("id,title").order("title"),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{path.title}</h1>
          <StatusBadge status={path.status} />
        </div>
        {path.description && <p className="text-slate-600">{path.description}</p>}
        {path.status === "PUBLISHED" && (
          <Link href={`/paths/${path.slug}`} className="text-sm text-brand-600 underline">Ver página pública</Link>
        )}
      </div>
      <PathInfoForm
        id={path.id}
        initial={{ title: path.title, description: path.description ?? "", target_audience: path.target_audience ?? "" }}
      />
      <PathBuilder path={{ id: path.id, status: path.status }} modules={modules ?? []} books={books ?? []} />
    </div>
  );
}
