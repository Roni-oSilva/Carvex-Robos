"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { aiService } from "@/services/ai.service";
import { opportunitySchema } from "@/lib/schemas";
import type { ActionResult } from "@/types";

const fail = (e: unknown): ActionResult<never> => ({
  ok: false,
  error: e instanceof Error ? e.message : "Falha ao chamar a IA.",
});

/** Gera o sumário e cria os capítulos vazios do livro. */
export async function generateEbookOutline(bookId: string, chapters = 8): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createClient();
  const { data: book } = await supabase.from("books").select("*").eq("id", bookId).single();
  if (!book) return { ok: false, error: "E-book não encontrado." };

  try {
    await supabase.from("books").update({ status: "GENERATING" }).eq("id", bookId);
    const outline = await aiService.generateOutline(
      {
        title: book.title,
        theme: book.theme,
        objective: book.objective,
        audience: book.target_audience,
        level: book.level,
        tone: book.tone,
        chapters,
      },
      bookId,
    );

    // Substitui os capítulos anteriores pelo novo sumário.
    await supabase.from("book_chapters").delete().eq("book_id", bookId);
    const { error } = await supabase.from("book_chapters").insert(
      outline.chapters.map((c, i) => ({
        book_id: bookId,
        title: c.title,
        subtitle: c.subtitle,
        content: `<p><em>${c.summary}</em></p>`,
        order_index: i,
      })),
    );
    if (error) throw new Error(error.message);

    await supabase
      .from("books")
      .update({ subtitle: book.subtitle ?? outline.subtitle, status: "REVIEW" })
      .eq("id", bookId);
    revalidatePath("/ebooks");
    return { ok: true };
  } catch (e) {
    await supabase.from("books").update({ status: "DRAFT" }).eq("id", bookId);
    return fail(e);
  }
}

export async function generateChapterContent(chapterId: string): Promise<ActionResult<{ content: string }>> {
  await requireAdmin();
  const supabase = createClient();
  const { data: chapter } = await supabase.from("book_chapters").select("*").eq("id", chapterId).single();
  if (!chapter) return { ok: false, error: "Capítulo não encontrado." };

  const [{ data: book }, { data: all }] = await Promise.all([
    supabase.from("books").select("*").eq("id", chapter.book_id).single(),
    supabase.from("book_chapters").select("title").eq("book_id", chapter.book_id).order("order_index"),
  ]);
  if (!book) return { ok: false, error: "E-book não encontrado." };

  try {
    const content = await aiService.generateChapter(
      {
        bookTitle: book.title,
        chapterTitle: chapter.title,
        chapterSummary: chapter.subtitle,
        audience: book.target_audience,
        tone: book.tone,
        outline: all?.map((c) => c.title),
      },
      book.id,
    );
    const { error } = await supabase
      .from("book_chapters")
      .update({ content, updated_at: new Date().toISOString() })
      .eq("id", chapterId);
    if (error) throw new Error(error.message);
    return { ok: true, data: { content } };
  } catch (e) {
    return fail(e);
  }
}

export async function reviewChapterContent(chapterId: string) {
  await requireAdmin();
  const supabase = createClient();
  const { data: chapter } = await supabase.from("book_chapters").select("*").eq("id", chapterId).single();
  if (!chapter?.content) return { ok: false, error: "Capítulo sem conteúdo." } as ActionResult<never>;
  try {
    const review = await aiService.reviewContent(chapter.content, null, chapter.book_id);
    return { ok: true, data: review } as ActionResult<typeof review>;
  } catch (e) {
    return fail(e);
  }
}

export async function generateSalesPage(bookId: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createClient();
  const [{ data: book }, { data: chapters }] = await Promise.all([
    supabase.from("books").select("*").eq("id", bookId).single(),
    supabase.from("book_chapters").select("title").eq("book_id", bookId).order("order_index"),
  ]);
  if (!book) return { ok: false, error: "E-book não encontrado." };

  try {
    const page = await aiService.generateSalesPage(
      {
        title: book.title,
        subtitle: book.subtitle,
        audience: book.target_audience,
        objective: book.objective,
        chapters: chapters?.map((c) => c.title) ?? [],
      },
      bookId,
    );
    const { error } = await supabase.from("books").update({ sales_page_content: page }).eq("id", bookId);
    if (error) throw new Error(error.message);
    revalidatePath("/ebooks");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

const niche = z.object({ niche: z.string().min(2).max(200), audience: z.string().max(200).optional() });

/** Pede sugestões à IA e salva como oportunidades "nova". */
export async function discoverOpportunities(input: z.infer<typeof niche>): Promise<ActionResult<{ count: number }>> {
  await requireAdmin();
  const parsed = niche.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  try {
    const raw = await aiService.findOpportunities(parsed.data);
    const rows = raw.flatMap((o) => {
      const r = opportunitySchema.safeParse({ ...o, source: "IA" });
      return r.success ? [r.data] : [];
    });
    if (!rows.length) return { ok: false, error: "A IA não retornou oportunidades válidas." };

    const { error } = await createClient().from("opportunities").insert(rows);
    if (error) throw new Error(error.message);
    revalidatePath("/radar");
    return { ok: true, data: { count: rows.length } };
  } catch (e) {
    return fail(e);
  }
}
