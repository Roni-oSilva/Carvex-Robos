import { z } from "zod";

export const ebookFormSchema = z.object({
  title: z.string().min(3, "Mínimo de 3 caracteres").max(160),
  subtitle: z.string().max(240).optional().or(z.literal("")),
  theme: z.string().max(200).optional().or(z.literal("")),
  objective: z.string().max(500).optional().or(z.literal("")),
  target_audience: z.string().max(300).optional().or(z.literal("")),
  author: z.string().max(120).optional().or(z.literal("")),
  level: z.string().max(60).optional().or(z.literal("")),
  tone: z.string().max(120).optional().or(z.literal("")),
  category_id: z.string().uuid().optional().or(z.literal("")),
});
export type EbookFormInput = z.infer<typeof ebookFormSchema>;

const score = z.coerce.number().int().min(0).max(100).default(0);

export const opportunitySchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional().nullable(),
  audience: z.string().max(300).optional().nullable(),
  problem: z.string().max(1000).optional().nullable(),
  need: z.string().max(1000).optional().nullable(),
  trend: z.string().max(1000).optional().nullable(),
  interest_level: score,
  commercial_potential: score,
  difficulty: score,
  competition: z.string().max(60).optional().nullable(),
  keywords: z.array(z.string()).max(30).optional().nullable(),
  source: z.string().max(200).optional().nullable(),
  source_url: z.string().url().optional().nullable(),
});


export const pathSchema = z.object({
  title: z.string().min(3, "Mínimo de 3 caracteres").max(160),
  description: z.string().max(1000).optional().or(z.literal("")),
  target_audience: z.string().max(300).optional().or(z.literal("")),
});
export type PathInput = z.infer<typeof pathSchema>;
