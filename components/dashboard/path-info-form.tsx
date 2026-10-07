"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updatePath } from "@/actions/path.actions";
import { pathSchema, type PathInput } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PathInfoForm({ id, initial }: { id: string; initial: PathInput }) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PathInput>({
    resolver: zodResolver(pathSchema),
    defaultValues: initial,
  });

  return (
    <form
      className="max-w-xl space-y-3 rounded-lg border bg-white p-4"
      onSubmit={handleSubmit(async (v) => {
        const res = await updatePath(id, v);
        setMsg(res.ok ? "Salvo." : res.error ?? "Erro.");
        if (res.ok) router.refresh();
      })}
    >
      <Input label="Título" error={errors.title?.message} {...register("title")} />
      <Input label="Descrição" {...register("description")} />
      <Input label="Público-alvo" {...register("target_audience")} />
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>Salvar dados</Button>
        {msg && <span role="status" className="text-sm text-slate-600">{msg}</span>}
      </div>
    </form>
  );
}
