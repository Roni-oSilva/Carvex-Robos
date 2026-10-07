# Fábrica de E-books

Next.js 14 (App Router) + Supabase + Claude (Anthropic) + Tiptap.

## Começando

1. `cp .env.example .env.local` e preencha as chaves.
2. Rode `supabase/schema.sql` no SQL Editor do Supabase.
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

`/dashboard`, `/radar`, `/ebooks`, `/ebooks/new`, `/ebooks/[slug]/edit`; `/products`, `/paths`, `/library`, `/analytics` e `/settings` são placeholders.

`ANTHROPIC_API_KEY` e `SUPABASE_SERVICE_ROLE_KEY` nunca vão ao browser (`server-only`).
