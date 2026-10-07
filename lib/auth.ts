import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";

/** Garante sessão de ADMIN em Server Components/Actions. Redireciona se não for. */
export async function requireAdmin(): Promise<Profile> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,email,full_name,role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "ADMIN") redirect("/login?error=forbidden");
  return profile as Profile;
}
