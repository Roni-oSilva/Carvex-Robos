# Fábrica de E-books

Next.js 14 (App Router) + Supabase + Claude (Anthropic) + Tiptap.

## Começando

1. `cp .env.example .env.local` e preencha as chaves.
2. Rode `supabase/schema.sql` e depois `supabase/migrations/002_storage.sql` (buckets de capas e exports) no SQL Editor do Supabase.
3. Crie um usuário em Authentication → Users e promova-o a admin:
   `update profiles set role = 'ADMIN' where email = 'voce@exemplo.com';`
4. `npm install && npm run dev` e acesse `/login`.

## Estrutura

- `app/(admin)` — painel (exige `ADMIN`, checado em `lib/auth.ts` e pelo RLS)
- `app/(public)` — páginas públicas `/ebooks/[slug]` e `/paths/[slug]` (somente `PUBLISHED`)
- `actions/` — Server Actions (todas chamam `requireAdmin()`)
- `services/ai.service.ts` + `prompts/` — única camada que fala com a Anthropic; registra tokens/custo em `ai_generations`
- `lib/schemas.ts` — schemas Zod compartilhados (arquivos `"use server"` só exportam funções async)

## Rotas do painel

`/dashboard`, `/radar` (oportunidade → e-book), `/ebooks` (+ `/new`, `/[slug]/edit`), `/products/[slug]` (página de vendas), `/paths` (+ `/new`, `/[slug]/edit`), `/library` (capa, versões, export HTML), `/analytics` (custos de IA) e `/settings` (categorias, tags, padrões).

Públicas: `/ebooks/[slug]`, `/ebooks/[slug]/vendas`, `/paths/[slug]`.

`ANTHROPIC_API_KEY` e `SUPABASE_SERVICE_ROLE_KEY` nunca vão ao browser (`server-only`).

## Deploy (Vercel + Supabase)

1. Supabase: crie o projeto, rode `supabase/schema.sql`, crie o usuário e promova-o a ADMIN.
2. Vercel: importe este repositório (framework Next.js, sem configuração extra).
3. Em Settings → Environment Variables, defina as 5 variáveis de `.env.example`.
4. Supabase → Authentication → URL Configuration: coloque a URL da Vercel em *Site URL*.
5. Deploy. Acesse `/login`.
