"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { opportunitySchema } from "@/lib/schemas";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/utils/slug";
import type { ActionResult, OpportunityStatus } from "@/types";

export async function createOpportunity(input: z.input<typeof opportunitySchema>): Promise<ActionResult> {
  await requireAdmin();
  const parsed = opportunitySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const { error } = await createClient().from("opportunities").insert(parsed.data);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/radar");
  return { ok: true };
}

export async function setOpportunityStatus(id: string, status: OpportunityStatus): Promise<ActionResult> {
  await requireAdmin();
  const { error } = await createClient()
    .from("opportunities")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/radar");
  return { ok: true };
}

export async function deleteOpportunity(id: string): Promise<ActionResult> {
  await requireAdmin();
  const { error } = await createClient().from("opportunities").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/radar");
  return { ok: true };
}

/** Cria um e-book (rascunho) a partir da oportunidade e marca-a como "transformada". */
export async function convertOpportunityToEbook(id: string): Promise<ActionResult<{ slug: string }>> {
  await requireAdmin();
  const supabase = createClient();
  const { data: o } = await supabase.from("opportunities").select("*").eq("id", id).single();
  if (!o) return { ok: false, error: "Oportunidade não encontrada." };
  if (o.status === "transformada") return { ok: false, error: "Já foi transformada em e-book." };

  const base = slugify(o.title) || "ebook";
  for (let i = 0; i < 5; i++) {
    const slug = i === 0 ? base : `${base}-${Math.random().toString(36).slice(2, 6)}`;
    const { error } = await supabase.from("books").insert({
      title: o.title,
      slug,
      theme: o.description,
      objective: o.problem ?? o.need,
      target_audience: o.audience,
      category_id: o.category_id,
    });
    if (!error) {
      await supabase.from("opportunities").update({ status: "transformada", updated_at: new Date().toISOString() }).eq("id", id);
      revalidatePath("/radar");
      revalidatePath("/ebooks");
      return { ok: true, data: { slug } };
    }
    if (error.code !== "23505") return { ok: false, error: error.message };
  }
  return { ok: false, error: "Não foi possível gerar um slug único." };
}
