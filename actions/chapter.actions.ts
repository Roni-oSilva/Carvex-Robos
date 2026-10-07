"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types";

const chapterSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  subtitle: z.string().max(240).nullable().optional(),
  content: z.string().max(500_000).nullable().optional(),
  status: z.enum(["draft", "review", "final"]).optional(),
});

export async function addChapter(bookId: string, title: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createClient();
  const { data: last } = await supabase
    .from("book_chapters")
    .select("order_index")
    .eq("book_id", bookId)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase
    .from("book_chapters")
    .insert({ book_id: bookId, title, order_index: (last?.order_index ?? -1) + 1 });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/ebooks");
  return { ok: true };
}

export async function updateChapter(id: string, input: z.infer<typeof chapterSchema>): Promise<ActionResult> {
  await requireAdmin();
  const parsed = chapterSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const { error } = await createClient()
    .from("book_chapters")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteChapter(id: string): Promise<ActionResult> {
  await requireAdmin();
  const { error } = await createClient().from("book_chapters").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/ebooks");
  return { ok: true };
}
