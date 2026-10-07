"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEbook } from "@/actions/ebook.actions";
import { ebookFormSchema, type EbookFormInput } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  categories: { id: string; name: string }[];
  defaults?: { default_author?: string; default_tone?: string; default_level?: string };
}

export function EbookForm({ categories, defaults }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<EbookFormInput>({
    resolver: zodResolver(ebookFormSchema),
    defaultValues: { author: defaults?.default_author ?? "", tone: defaults?.default_tone ?? "", level: defaults?.default_level ?? "", category_id: "" },
  });

  async function onSubmit(values: EbookFormInput) {
    setError(null);
    const res = await createEbook(values);
    if (!res.ok) return setError(res.error ?? "Erro ao criar.");
    router.push(`/ebooks/${res.data!.slug}/edit`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-4">
      <Input label="Título" error={errors.title?.message} {...register("title")} />
      <Input label="Subtítulo" {...register("subtitle")} />
      <Input label="Tema" {...register("theme")} />
      <Input label="Objetivo" {...register("objective")} />
      <Input label="Público-alvo" {...register("target_audience")} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Autor" {...register("author")} />
        <Input label="Nível" placeholder="iniciante, intermediário…" {...register("level")} />
      </div>
      <Input label="Tom de voz" {...register("tone")} />
      <div>
        <label htmlFor="category_id" className="mb-1 block text-sm font-medium">Categoria</label>
        <select id="category_id" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" {...register("category_id")}>
          <option value="">Sem categoria</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Criando…" : "Criar e-book"}</Button>
    </form>
  );
}
