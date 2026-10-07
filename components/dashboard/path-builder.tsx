"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addItem, addModule, deleteItem, deleteModule, deletePath, setPathStatus } from "@/actions/path.actions";
import { Button } from "@/components/ui/button";
import { MoveButtons } from "@/components/shared/move-buttons";

interface Item { id: string; title: string; item_type: string; order_index: number }
interface Module { id: string; title: string; description: string | null; learning_path_items: Item[] }
interface Props {
  path: { id: string; status: string };
  modules: Module[];
  books: { id: string; title: string }[];
}

const TYPES = ["ebook", "exercise", "checklist", "video", "outro"] as const;

export function PathBuilder({ path, modules, books }: Props) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [moduleTitle, setModuleTitle] = useState("");
  const [pending, start] = useTransition();

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, after?: () => void) =>
    start(async () => {
      const res = await fn();
      if (!res.ok) setMsg(res.error ?? "Erro.");
      else {
        setMsg(null);
        after?.();
        router.refresh();
      }
    });

  const published = path.status === "PUBLISHED";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant={published ? "secondary" : "primary"} disabled={pending} onClick={() => run(() => setPathStatus(path.id, published ? "DRAFT" : "PUBLISHED"))}>
          {published ? "Despublicar" : "Publicar"}
        </Button>
        <Button
          variant="danger"
          disabled={pending}
          onClick={() => confirm("Excluir esta trilha e todos os módulos?") && run(() => deletePath(path.id), () => router.push("/paths"))}
        >
          Excluir trilha
        </Button>
        {msg && <span role="alert" className="text-sm text-red-600">{msg}</span>}
      </div>

      {modules.map((m) => (
        <ModuleCard key={m.id} module={m} books={books} pending={pending} run={run} />
      ))}

      <form
        className="flex max-w-xl gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          run(() => addModule(path.id, moduleTitle), () => setModuleTitle(""));
        }}
      >
        <input
          aria-label="Título do novo módulo"
          placeholder="Novo módulo…"
          value={moduleTitle}
          onChange={(e) => setModuleTitle(e.target.value)}
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <Button type="submit" disabled={pending || moduleTitle.trim().length < 2}>Adicionar módulo</Button>
      </form>
    </div>
  );
}

function ModuleCard({
  module: m, books, pending, run,
}: {
  module: Module;
  books: Props["books"];
  pending: boolean;
  run: (fn: () => Promise<{ ok: boolean; error?: string }>, after?: () => void) => void;
}) {
  const [type, setType] = useState<(typeof TYPES)[number]>("ebook");
  const [bookId, setBookId] = useState("");
  const [title, setTitle] = useState("");

  const items = [...m.learning_path_items].sort((a, b) => a.order_index - b.order_index);
  const isBook = type === "ebook";
  const itemTitle = isBook ? books.find((b) => b.id === bookId)?.title ?? "" : title;

  return (
    <section className="rounded-lg border bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold"><MoveButtons kind="module" id={m.id} />{m.title}</h2>
        <Button
          variant="ghost"
          className="px-2 py-1 text-xs"
          disabled={pending}
          onClick={() => confirm(`Excluir o módulo "${m.title}"?`) && run(() => deleteModule(m.id))}
        >
          Excluir módulo
        </Button>
      </div>
      <ul className="mt-2 divide-y text-sm">
        {items.map((i) => (
          <li key={i.id} className="flex items-center justify-between py-2">
            <span className="flex items-center gap-2"><MoveButtons kind="item" id={i.id} />{i.title} <span className="text-slate-400">({i.item_type})</span></span>
            <Button variant="ghost" className="px-2 py-1 text-xs" disabled={pending} onClick={() => run(() => deleteItem(i.id))}>Remover</Button>
          </li>
        ))}
        {!items.length && <li className="py-2 text-slate-500">Sem itens.</li>}
      </ul>
      <form
        className="mt-3 flex flex-wrap items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          run(
            () => addItem(m.id, { title: itemTitle, item_type: type, book_id: isBook ? bookId : null }),
            () => { setTitle(""); setBookId(""); },
          );
        }}
      >
        <select aria-label="Tipo do item" value={type} onChange={(e) => setType(e.target.value as typeof type)} className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm">
          {TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        {isBook ? (
          <select aria-label="E-book" value={bookId} onChange={(e) => setBookId(e.target.value)} className="min-w-[200px] flex-1 rounded-md border border-slate-300 bg-white px-2 py-2 text-sm">
            <option value="">Escolha um e-book…</option>
            {books.map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}
          </select>
        ) : (
          <input aria-label="Título do item" placeholder="Título do item" value={title} onChange={(e) => setTitle(e.target.value)} className="min-w-[200px] flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm" />
        )}
        <Button type="submit" variant="secondary" disabled={pending || itemTitle.trim().length < 2}>Adicionar item</Button>
      </form>
    </section>
  );
}
