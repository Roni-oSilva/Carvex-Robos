"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPath } from "@/actions/path.actions";
import { pathSchema, type PathInput } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PathForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PathInput>({ resolver: zodResolver(pathSchema) });

  return (
    <form
      className="max-w-xl space-y-4"
      onSubmit={handleSubmit(async (values) => {
        setError(null);
        const res = await createPath(values);
        if (!res.ok) return setError(res.error ?? "Erro ao criar.");
        router.push(`/paths/${res.data!.slug}/edit`);
      })}
    >
      <Input label="Título" error={errors.title?.message} {...register("title")} />
      <Input label="Descrição" {...register("description")} />
      <Input label="Público-alvo" {...register("target_audience")} />
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Criando…" : "Criar trilha"}</Button>
    </form>
  );
}
