import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { data: books } = await createClient()
    .from("books")
    .select("title,subtitle,slug")
    .eq("status", "PUBLISHED")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-bold">Fábrica de E-books</h1>
      <p className="mt-2 text-slate-600">Conteúdo publicado</p>
      <ul className="mt-8 space-y-3">
        {books?.map((b) => (
          <li key={b.slug}>
            <Link href={`/ebooks/${b.slug}`} className="block rounded-lg border bg-white p-4 hover:border-brand-500">
              <span className="font-semibold">{b.title}</span>
              {b.subtitle && <span className="block text-sm text-slate-600">{b.subtitle}</span>}
            </Link>
          </li>
        ))}
        {!books?.length && <li className="text-slate-500">Nenhum e-book publicado ainda.</li>}
      </ul>
      <Link href="/dashboard" className="mt-10 inline-block text-sm text-brand-600 underline">
        Área administrativa
      </Link>
    </main>
  );
}
