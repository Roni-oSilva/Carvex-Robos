import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { aiService } from "@/services/ai.service";

export const runtime = "nodejs";
export const maxDuration = 60;

const body = z.object({
  type: z.literal("opportunity"),
  niche: z.string().min(2).max(200),
  audience: z.string().max(200).optional(),
});

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "ADMIN") return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  try {
    const opportunities = await aiService.findOpportunities(parsed.data);
    return NextResponse.json({ opportunities });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Erro na IA." }, { status: 502 });
  }
}
