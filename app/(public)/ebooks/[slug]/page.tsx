import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function load(slug: string) {
  const supabase = createClient();
  // RLS já restringe a livros PUBLISHED para visitantes; o filtro deixa explícito.
  const { data: book } = await supabase.from("books").select("*").eq("slug", slug).eq("status", "PUBLISHED").maybeSingle();
  if (!book) return null;
  const { data: chapters } = await supabase.from("book_chapters").select("id,title,content").eq("book_id", book.id).order("order_index");
  return { book, chapters: chapters ?? [] };
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const r = await load(params.slug);
  return { title: r?.book.title ?? "E-book", description: r?.book.subtitle ?? undefined };
}

export default async function PublicEbookPage({ params }: { params: { slug: string } }) {
  const r = await load(params.slug);
  if (!r) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl font-bold">{r.book.title}</h1>
      {r.book.subtitle && <p className="mt-2 text-lg text-slate-600">{r.book.subtitle}</p>}
      {r.chapters.map((c) => (
        <section key={c.id} className="mt-10">
          <h2 className="text-2xl font-semibold">{c.title}</h2>
          {/* Conteúdo é HTML gerado/editado apenas por ADMIN (RLS), nunca por visitantes. */}
          <div className="prose-content" dangerouslySetInnerHTML={{ __html: c.content ?? "" }} />
        </section>
      ))}
    </article>
  );
}
