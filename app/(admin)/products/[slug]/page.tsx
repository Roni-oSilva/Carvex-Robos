import { notFound } from "next/navigation";
import { SalesPageEditor } from "@/components/dashboard/sales-page-editor";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const { data: book } = await createClient()
    .from("books")
    .select("id,title,sales_page_content")
    .eq("slug", params.slug)
    .maybeSingle();
  if (!book) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Página de vendas — {book.title}</h1>
      {/* key força remontar o editor quando a IA regrava o conteúdo */}
      <SalesPageEditor key={JSON.stringify(book.sales_page_content)} bookId={book.id} initial={book.sales_page_content} />
    </div>
  );
}
