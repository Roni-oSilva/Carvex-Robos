"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const schema = z.object({
  full_name: z.string().min(2, "Informe seu nome"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "Mínimo de 8 caracteres"),
});

export default function SignupPage() {
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  async function onSubmit({ full_name, email, password }: z.infer<typeof schema>) {
    setStatus(null);
    const { error } = await createClient().auth.signUp({
      email,
      password,
      options: { data: { full_name }, emailRedirectTo: `${window.location.origin}/login` },
    });
    setStatus(
      error
        ? { ok: false, text: error.message }
        : { ok: true, text: "Conta criada. Confirme o e-mail (se exigido) e faça login." },
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="mb-6 text-2xl font-bold">Criar conta</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Nome" autoComplete="name" error={errors.full_name?.message} {...register("full_name")} />
        <Input label="E-mail" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
        <Input label="Senha" type="password" autoComplete="new-password" error={errors.password?.message} {...register("password")} />
        {status && <p role="status" className={status.ok ? "text-sm text-green-700" : "text-sm text-red-600"}>{status.text}</p>}
        <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? "Criando…" : "Criar conta"}</Button>
      </form>
      <p className="mt-4 text-sm text-slate-600">Já tem conta? <Link href="/login" className="text-brand-600 underline">Entrar</Link></p>
    </main>
  );
}
