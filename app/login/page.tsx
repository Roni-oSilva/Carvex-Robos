"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const schema = z.object({ email: z.string().email("E-mail inválido"), password: z.string().min(6, "Mínimo de 6 caracteres") });

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    setError(null);
    const { error } = await createClient().auth.signInWithPassword(values);
    if (error) return setError("E-mail ou senha incorretos.");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="mb-6 text-2xl font-bold">Entrar</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="E-mail" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
        <Input label="Senha" type="password" autoComplete="current-password" error={errors.password?.message} {...register("password")} />
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Entrando…" : "Entrar"}
        </Button>
      </form>
    </main>
  );
}
