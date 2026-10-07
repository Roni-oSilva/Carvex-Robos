"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { buildBookHtml } from "@/utils/export";
import type { ActionResult, Book, BookChapter } from "@/types";

const MAX_COVER = 3 * 1024 * 1024;
const COVER_TYPES: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };

export async function uploadCover(bookId: string, formData: FormData): Promise<ActionResult<{ url: string }>> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Selecione uma imagem." };
  const ext = COVER_TYPES[file.type];
  if (!ext) return { ok: false, error: "Use PNG, JPG ou WebP." };
  if (file.size > MAX_COVER) return { ok: false, error: "Máximo de 3 MB." };

  const supabase = createClient();
  const path = `${bookId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("covers").upload(path, file, { contentType: file.type });
  if (error) return { ok: false, error: error.message };

  const url = supabase.storage.from("covers").getPublicUrl(path).data.publicUrl;
  const { error: dbErr } = await supabase.from("books").update({ cover_url: url }).eq("id", bookId);
  if (dbErr) return { ok: false, error: dbErr.message };
  revalidatePath("/library");
  return { ok: true, data: { url } };
}

function bumpVersion(v: string): string {
  const [major, minor] = v.split(".").map((n) => parseInt(n, 10));
  return Number.isFinite(major) ? `${major}.${(Number.isFinite(minor) ? minor : 0) + 1}` : "1.1";
}

/** Congela o estado atual como versão (HTML no bucket privado) e incrementa a versão do livro. */
export async function createVersion(bookId: string, summary: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  const supabase = createClient();

  const [{ data: book }, { data: chapters }] = await Promise.all([
    supabase.from("books").select("*").eq("id", bookId).single(),
    supabase.from("book_chapters").select("*").eq("book_id", bookId).order("order_index"),
  ]);
  if (!book) return { ok: false, error: "E-book não encontrado." };
  if (!chapters?.length) return { ok: false, error: "O e-book não tem capítulos." };

  const html = buildBookHtml(book as Book, chapters as BookChapter[]);
  const path = `${bookId}/v${book.version}-${Date.now()}.html`;
  const { error: upErr } = await supabase.storage
    .from("exports")
    .upload(path, new Blob([html], { type: "text/html" }), { contentType: "text/html" });
  if (upErr) return { ok: false, error: upErr.message };

  const { error } = await supabase.from("book_versions").insert({
    book_id: bookId,
    version_number: book.version,
    changes_summary: summary.trim() || null,
    file_url: path,
    created_by: admin.id,
  });
  if (error) return { ok: false, error: error.message };

  await supabase.from("books").update({ version: bumpVersion(book.version) }).eq("id", bookId);
  revalidatePath("/library");
  revalidatePath("/ebooks");
  return { ok: true };
}
