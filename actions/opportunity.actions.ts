"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { opportunitySchema } from "@/lib/schemas";
import { createClient } from "@/lib/supabase/server";
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
