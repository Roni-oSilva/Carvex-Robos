"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types";

const TABLES = {
  chapter: { table: "book_chapters", scope: "book_id", path: "/ebooks" },
  module: { table: "learning_path_modules", scope: "path_id", path: "/paths" },
  item: { table: "learning_path_items", scope: "module_id", path: "/paths" },
} as const;

export type Orderable = keyof typeof TABLES;

/** Move um registro uma posição para cima/baixo e regrava os índices 0..n-1 do grupo. */
export async function moveRow(kind: Orderable, id: string, dir: "up" | "down"): Promise<ActionResult> {
  await requireAdmin();
  const cfg = TABLES[kind];
  const supabase = createClient();

  const { data: row } = await supabase.from(cfg.table).select(`id,${cfg.scope}`).eq("id", id).single();
  if (!row) return { ok: false, error: "Registro não encontrado." };
  const scopeId = (row as unknown as Record<string, string>)[cfg.scope];

  const { data: siblings } = await supabase
    .from(cfg.table)
    .select("id,order_index")
    .eq(cfg.scope, scopeId)
    .order("order_index")
    .order("created_at");
  const list = (siblings ?? []) as { id: string; order_index: number }[];

  const from = list.findIndex((s) => s.id === id);
  const to = dir === "up" ? from - 1 : from + 1;
  if (from < 0 || to < 0 || to >= list.length) return { ok: true };

  [list[from], list[to]] = [list[to], list[from]];
  const results = await Promise.all(
    list.map((s, i) => (s.order_index === i ? null : supabase.from(cfg.table).update({ order_index: i }).eq("id", s.id))),
  );
  const failed = results.find((r) => r?.error);
  if (failed?.error) return { ok: false, error: failed.error.message };

  revalidatePath(cfg.path);
  return { ok: true };
}
