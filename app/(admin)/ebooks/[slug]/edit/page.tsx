import { notFound } from "next/navigation";
import { ChapterEditor } from "@/components/editor/chapter-editor";
import { EbookToolbar } from "@/components/dashboard/ebook-toolbar";
import { StatusBadge } from "@/components/shared/status-badge";
import { createClient } from "@/lib/supabase/server";
import type { Book, BookChapter } from "@/types";

export const dynamic = "force-dynamic";

export default async function EditEbookPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: book } = await supabase.from("books").select("*").eq("slug", params.slug).maybeSingle();
  if (!book) notFound();

  const { data: chapters } = await supabase
    .from("book_chapters")
    .select("*")
    .eq("book_id", book.id)
    .order("order_index");

  const list = (chapters ?? []) as BookChapter[];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{(book as Book).title}</h1>
          <StatusBadge status={book.status} />
        </div>
        {book.subtitle && <p className="text-slate-600">{book.subtitle}</p>}
      </div>
      <EbookToolbar book={book as Book} hasChapters={list.length > 0} />
      <div className="space-y-6">
        {list.map((c) => (
          // key inclui updated_at para remontar o editor quando a IA regrava o capítulo.
          <ChapterEditor key={`${c.id}-${c.updated_at}`} chapter={c} />
        ))}
        {!list.length && <p className="text-sm text-slate-500">Sem capítulos. Gere o sumário com IA ou adicione manualmente.</p>}
      </div>
    </div>
  );
}
