"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/utils/slug";
import type { ActionResult } from "@/types";

const name = z.string().trim().min(2, "Mínimo de 2 caracteres").max(60);

async function add(table: "categories" | "tags", raw: string): Promise<ActionResult> {
  await requireAdmin();
  const parsed = name.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { error } = await createClient().from(table).insert({ name: parsed.data, slug: slugify(parsed.data) });
  if (error) return { ok: false, error: error.code === "23505" ? "Já existe." : error.message };
  revalidatePath("/settings");
  return { ok: true };
}

async function remove(table: "categories" | "tags", id: string): Promise<ActionResult> {
  await requireAdmin();
  const { error } = await createClient().from(table).delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/settings");
  return { ok: true };
}

export const addCategory = (n: string) => add("categories", n);
export const deleteCategory = (id: string) => remove("categories", id);
export const addTag = (n: string) => add("tags", n);
export const deleteTag = (id: string) => remove("tags", id);

const defaults = z.object({
  default_author: z.string().max(120),
  default_tone: z.string().max(120),
  default_level: z.string().max(60),
});

export async function saveDefaults(input: z.infer<typeof defaults>): Promise<ActionResult> {
  await requireAdmin();
  const parsed = defaults.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { error } = await createClient()
    .from("settings")
    .upsert({ key: "ebook_defaults", value: parsed.data, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/settings");
  return { ok: true };
}
