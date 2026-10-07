import { DefaultsForm } from "@/components/dashboard/defaults-form";
import { CategoriesManager, TagsManager } from "@/components/dashboard/taxonomy-sections";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Configurações" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = createClient();
  const [{ data: categories }, { data: tags }, { data: defaults }] = await Promise.all([
    supabase.from("categories").select("id,name").order("name"),
    supabase.from("tags").select("id,name").order("name"),
    supabase.from("settings").select("value").eq("key", "ebook_defaults").maybeSingle(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Configurações</h1>
      <div className="grid max-w-4xl gap-4 md:grid-cols-2">
        <CategoriesManager items={categories ?? []} />
        <TagsManager items={tags ?? []} />
        <DefaultsForm initial={defaults?.value ?? {}} />
      </div>
      <p className="text-xs text-slate-500">
        Modelo de IA em uso: <code>{process.env.ANTHROPIC_MODEL ?? "claude-3-5-sonnet-20241022"}</code> (variável ANTHROPIC_MODEL).
      </p>
    </div>
  );
}
