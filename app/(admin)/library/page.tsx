import { LibraryActions } from "@/components/dashboard/library-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Biblioteca" };
export const dynamic = "force-dynamic";

interface Version { id: string; version_number: string; changes_summary: string | null; file_url: string | null; created_at: string }

export default async function LibraryPage() {
  const supabase = createClient();
  const { data: books } = await supabase
    .from("books")
    .select("id,title,slug,status,version,cover_url,book_versions(id,version_number,changes_summary,file_url,created_at)")
    .order("updated_at", { ascending: false });

  // URLs assinadas (1h) para os arquivos de versão no bucket privado.
  const versions = (books ?? []).flatMap((b) => (b.book_versions as Version[]).map((v) => v.file_url).filter(Boolean)) as string[];
  const signed = new Map<string, string>();
  if (versions.length) {
    const { data } = await supabase.storage.from("exports").createSignedUrls(versions, 3600);
    data?.forEach((s) => s.path && s.signedUrl && signed.set(s.path, s.signedUrl));
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Biblioteca</h1>
      {books?.map((b) => {
        const vs = [...(b.book_versions as Version[])].sort((x, y) => y.created_at.localeCompare(x.created_at));
        return (
          <section key={b.id} className="flex gap-4 rounded-lg border bg-white p-4">
            {b.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={b.cover_url} alt={`Capa de ${b.title}`} className="h-32 w-24 rounded object-cover" />
            ) : (
              <div className="flex h-32 w-24 items-center justify-center rounded bg-slate-100 text-xs text-slate-400">Sem capa</div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">{b.title}</h2>
                <StatusBadge status={b.status} />
                <span className="text-xs text-slate-500">próxima: v{b.version}</span>
              </div>
              <ul className="mt-2 space-y-1 text-sm">
                {vs.map((v) => (
                  <li key={v.id}>
                    v{v.version_number} · {new Date(v.created_at).toLocaleDateString("pt-BR")}
                    {v.changes_summary && <span className="text-slate-500"> — {v.changes_summary}</span>}
                    {v.file_url && signed.get(v.file_url) && (
                      <a href={signed.get(v.file_url)} className="ml-2 text-brand-600 underline">baixar</a>
                    )}
                  </li>
                ))}
                {!vs.length && <li className="text-slate-500">Nenhuma versão criada.</li>}
              </ul>
              <LibraryActions bookId={b.id} slug={b.slug} />
            </div>
          </section>
        );
      })}
      {!books?.length && <p className="text-sm text-slate-500">Nenhum e-book ainda.</p>}
    </div>
  );
}
