"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { pathSchema, type PathInput } from "@/lib/schemas";
import { slugify } from "@/utils/slug";
import type { ActionResult, ProductStatus } from "@/types";

const nullify = (v?: string) => (v ? v : null);

export async function createPath(input: PathInput): Promise<ActionResult<{ slug: string }>> {
  await requireAdmin();
  const parsed = pathSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const supabase = createClient();
  const base = slugify(parsed.data.title) || "trilha";
  for (let i = 0; i < 5; i++) {
    const slug = i === 0 ? base : `${base}-${Math.random().toString(36).slice(2, 6)}`;
    const { error } = await supabase.from("learning_paths").insert({
      title: parsed.data.title,
      description: nullify(parsed.data.description),
      target_audience: nullify(parsed.data.target_audience),
      slug,
    });
    if (!error) {
      revalidatePath("/paths");
      return { ok: true, data: { slug } };
    }
    if (error.code !== "23505") return { ok: false, error: error.message };
  }
  return { ok: false, error: "Não foi possível gerar um slug único." };
}

export async function setPathStatus(id: string, status: ProductStatus): Promise<ActionResult> {
  await requireAdmin();
  const { error } = await createClient()
    .from("learning_paths")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/paths");
  return { ok: true };
}

export async function deletePath(id: string): Promise<ActionResult> {
  await requireAdmin();
  const { error } = await createClient().from("learning_paths").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/paths");
  return { ok: true };
}

async function nextIndex(table: "learning_path_modules" | "learning_path_items", col: string, id: string) {
  const { data } = await createClient()
    .from(table)
    .select("order_index")
    .eq(col, id)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.order_index ?? -1) + 1;
}

export async function addModule(pathId: string, title: string, description?: string): Promise<ActionResult> {
  await requireAdmin();
  const t = z.string().trim().min(2).max(160).safeParse(title);
  if (!t.success) return { ok: false, error: "Título inválido." };
  const { error } = await createClient().from("learning_path_modules").insert({
    path_id: pathId,
    title: t.data,
    description: nullify(description),
    order_index: await nextIndex("learning_path_modules", "path_id", pathId),
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/paths");
  return { ok: true };
}

export async function deleteModule(id: string): Promise<ActionResult> {
  await requireAdmin();
  const { error } = await createClient().from("learning_path_modules").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/paths");
  return { ok: true };
}

const itemSchema = z.object({
  title: z.string().trim().min(2).max(160),
  item_type: z.enum(["ebook", "exercise", "checklist", "video", "outro"]),
  book_id: z.string().uuid().nullable(),
});

export async function addItem(moduleId: string, input: z.infer<typeof itemSchema>): Promise<ActionResult> {
  await requireAdmin();
  const parsed = itemSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { error } = await createClient().from("learning_path_items").insert({
    module_id: moduleId,
    ...parsed.data,
    order_index: await nextIndex("learning_path_items", "module_id", moduleId),
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/paths");
  return { ok: true };
}

export async function deleteItem(id: string): Promise<ActionResult> {
  await requireAdmin();
  const { error } = await createClient().from("learning_path_items").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/paths");
  return { ok: true };
}
