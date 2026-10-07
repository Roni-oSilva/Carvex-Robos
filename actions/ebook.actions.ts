"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ebookFormSchema as ebookSchema, type EbookFormInput as EbookInput } from "@/lib/schemas";
import { slugify } from "@/utils/slug";
import type { ActionResult, Book } from "@/types";

const blankToNull = (o: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v === "" ? null : v]));

export async function createEbook(input: EbookInput): Promise<ActionResult<{ slug: string }>> {
  await requireAdmin();
  const parsed = ebookSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const supabase = createClient();
  const base = slugify(parsed.data.title) || "ebook";

  // Tenta o slug base e depois sufixos até achar um livre.
  for (let i = 0; i < 5; i++) {
    const slug = i === 0 ? base : `${base}-${Math.random().toString(36).slice(2, 6)}`;
    const { error } = await supabase.from("books").insert({ ...blankToNull(parsed.data), slug });
    if (!error) {
      revalidatePath("/ebooks");
      return { ok: true, data: { slug } };
    }
    if (error.code !== "23505") return { ok: false, error: error.message };
  }
  return { ok: false, error: "Não foi possível gerar um slug único." };
}

export async function updateEbook(id: string, input: Partial<EbookInput>): Promise<ActionResult> {
  await requireAdmin();
  const parsed = ebookSchema.partial().safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const { error } = await createClient()
    .from("books")
    .update({ ...blankToNull(parsed.data), updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/ebooks");
  return { ok: true };
}

export async function setEbookStatus(id: string, status: Book["status"]): Promise<ActionResult> {
  await requireAdmin();
  const { error } = await createClient()
    .from("books")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/ebooks");
  return { ok: true };
}

export async function deleteEbook(id: string): Promise<ActionResult> {
  await requireAdmin();
  const { error } = await createClient().from("books").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/ebooks");
  return { ok: true };
}
