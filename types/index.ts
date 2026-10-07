export type UserRole = "ADMIN" | "USER" | "VISITOR";
export type ProductStatus = "DRAFT" | "GENERATING" | "REVIEW" | "READY" | "PUBLISHED" | "ARCHIVED";
export type OpportunityStatus = "nova" | "analisando" | "aprovada" | "transformada" | "descartada";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
}

export interface Book {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  theme: string | null;
  objective: string | null;
  target_audience: string | null;
  category_id: string | null;
  author: string | null;
  level: string | null;
  language: string;
  tone: string | null;
  style: string | null;
  status: ProductStatus;
  version: string;
  cover_url: string | null;
  sales_page_content: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface BookChapter {
  id: string;
  book_id: string;
  title: string;
  subtitle: string | null;
  content: string | null;
  order_index: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Opportunity {
  id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  audience: string | null;
  problem: string | null;
  need: string | null;
  trend: string | null;
  interest_level: number;
  commercial_potential: number;
  difficulty: number;
  competition: string | null;
  keywords: string[] | null;
  source: string | null;
  source_url: string | null;
  status: OpportunityStatus;
  created_at: string;
  updated_at: string;
}

export interface ActionResult<T = undefined> {
  ok: boolean;
  data?: T;
  error?: string;
}
