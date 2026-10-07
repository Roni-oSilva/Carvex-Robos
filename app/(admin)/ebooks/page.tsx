import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import { createClient } from "@/lib/supabase/server";
import type { Book } from "@/types";

export const metadata = { title: "E-books" };

export default async function EbooksPage() {
  const { data } = await createClient().from("books").select("*").order("created_at", { ascending: false });
  const books = (data ?? []) as Book[];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">E-books</h1>
        <Link href="/ebooks/new" className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          Novo e-book
        </Link>
      </div>
      <ul className="mt-6 divide-y rounded-lg border bg-white">
        {books.map((b) => (
          <li key={b.id} className="flex items-center justify-between p-4">
            <div>
              <Link href={`/ebooks/${b.slug}/edit`} className="font-medium hover:underline">{b.title}</Link>
              <p className="text-xs text-slate-500">v{b.version} · {new Date(b.updated_at).toLocaleDateString("pt-BR")}</p>
            </div>
            <StatusBadge status={b.status} />
          </li>
        ))}
        {!books.length && <li className="p-6 text-sm text-slate-500">Nenhum e-book ainda. Crie o primeiro.</li>}
      </ul>
    </div>
  );
}
