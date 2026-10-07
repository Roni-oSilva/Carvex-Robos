import { EbookForm } from "@/components/dashboard/ebook-form";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Novo e-book" };

export default async function NewEbookPage() {
  const supabase = createClient();
  const [{ data: categories }, { data: defaults }] = await Promise.all([
    supabase.from("categories").select("id,name").order("name"),
    supabase.from("settings").select("value").eq("key", "ebook_defaults").maybeSingle(),
  ]);
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Novo e-book</h1>
      <EbookForm categories={categories ?? []} defaults={defaults?.value} />
    </div>
  );
}
