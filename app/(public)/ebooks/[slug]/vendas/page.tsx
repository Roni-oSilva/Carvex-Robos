import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { SalesContent } from "@/components/dashboard/sales-page-editor";

export const dynamic = "force-dynamic";

async function load(slug: string) {
  const { data } = await createClient()
    .from("books")
    .select("title,cover_url,sales_page_content")
    .eq("slug", slug)
    .eq("status", "PUBLISHED")
    .maybeSingle();
  return data?.sales_page_content ? { ...data, sales: data.sales_page_content as SalesContent } : null;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const r = await load(params.slug);
  return { title: r?.sales.headline || r?.title || "E-book", description: r?.sales.subheadline };
}

export default async function SalesPage({ params }: { params: { slug: string } }) {
  const r = await load(params.slug);
  if (!r) notFound();
  const s = r.sales;

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-bold">{s.headline || r.title}</h1>
      {s.subheadline && <p className="mt-3 text-xl text-slate-600">{s.subheadline}</p>}
      {r.cover_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={r.cover_url} alt={`Capa de ${r.title}`} className="mt-8 max-h-96 rounded-lg shadow" />
      )}
      {!!s.benefits?.length && (
        <ul className="mt-8 list-disc space-y-2 pl-6 text-lg">
          {s.benefits.map((b, i) => <li key={i}>{b}</li>)}
        </ul>
      )}
      <Link href={`/ebooks/${params.slug}`} className="mt-10 inline-block rounded-md bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700">
        {s.cta || "Ler agora"}
      </Link>
      {!!s.faq?.length && (
        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Perguntas frequentes</h2>
          {s.faq.map((f, i) => (
            <details key={i} className="mt-3 rounded-md border bg-white p-3">
              <summary className="cursor-pointer font-medium">{f.q}</summary>
              <p className="mt-2 text-slate-700">{f.a}</p>
            </details>
          ))}
        </section>
      )}
    </main>
  );
}
