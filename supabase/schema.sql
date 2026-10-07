-- Fábrica de E-books — schema completo (Supabase PostgreSQL)
-- Execute no SQL Editor do Supabase.

create extension if not exists "uuid-ossp";

-- Enumerações
create type user_role as enum ('ADMIN', 'USER', 'VISITOR');
create type product_status as enum ('DRAFT', 'GENERATING', 'REVIEW', 'READY', 'PUBLISHED', 'ARCHIVED');
create type opportunity_status as enum ('nova', 'analisando', 'aprovada', 'transformada', 'descartada');

-- 1. Perfis
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role user_role default 'USER',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Categorias
create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Tags
create table tags (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Oportunidades (Radar)
create table opportunities (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  category_id uuid references categories(id) on delete set null,
  audience text,
  problem text,
  need text,
  trend text,
  interest_level integer default 0,
  commercial_potential integer default 0,
  difficulty integer default 0,
  competition text,
  keywords text[],
  source text,
  source_url text,
  status opportunity_status default 'nova',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. E-books
create table books (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  subtitle text,
  slug text not null unique,
  theme text,
  objective text,
  target_audience text,
  category_id uuid references categories(id) on delete set null,
  author text,
  level text,
  language text default 'pt-BR',
  tone text,
  style text,
  status product_status default 'DRAFT',
  version text default '1.0',
  cover_url text,
  sales_page_content jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Capítulos
create table book_chapters (
  id uuid primary key default uuid_generate_v4(),
  book_id uuid references books(id) on delete cascade not null,
  title text not null,
  subtitle text,
  content text,
  order_index integer not null,
  status text default 'draft',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Versões
create table book_versions (
  id uuid primary key default uuid_generate_v4(),
  book_id uuid references books(id) on delete cascade not null,
  version_number text not null,
  changes_summary text,
  file_url text,
  created_by uuid references profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Gerações de IA e custos
create table ai_generations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete set null,
  book_id uuid references books(id) on delete set null,
  generation_type text not null, -- 'outline', 'chapter', 'review', 'opportunity', etc.
  model text not null,
  prompt_version text,
  input_tokens integer,
  output_tokens integer,
  estimated_cost numeric(10, 4),
  status text not null, -- 'success', 'error'
  error_message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Trilhas
create table learning_paths (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text not null unique,
  description text,
  target_audience text,
  status product_status default 'DRAFT',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. Módulos da trilha
create table learning_path_modules (
  id uuid primary key default uuid_generate_v4(),
  path_id uuid references learning_paths(id) on delete cascade not null,
  title text not null,
  description text,
  order_index integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. Itens da trilha
create table learning_path_items (
  id uuid primary key default uuid_generate_v4(),
  module_id uuid references learning_path_modules(id) on delete cascade not null,
  book_id uuid references books(id) on delete cascade,
  title text not null,
  item_type text not null, -- 'ebook', 'exercise', 'checklist', etc.
  order_index integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 12. Configurações
create table settings (
  id uuid primary key default uuid_generate_v4(),
  key text not null unique,
  value jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Índices
create index idx_books_slug on books(slug);
create index idx_books_status on books(status);
create index idx_book_chapters_book_id on book_chapters(book_id);
create index idx_opportunities_status on opportunities(status);
create index idx_ai_generations_user_id on ai_generations(user_id);
create index idx_lp_modules_path_id on learning_path_modules(path_id);
create index idx_lp_items_module_id on learning_path_items(module_id);

-- Cria o perfil automaticamente ao cadastrar um usuário no Auth
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Helper de autorização.
-- SECURITY DEFINER evita recursão/bloqueio de RLS ao consultar "profiles"
-- de dentro das policies (com RLS ativo em profiles, a subquery inline
-- retornaria vazio e nenhum admin seria reconhecido).
create or replace function is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'ADMIN');
$$;

-- SEGURANÇA: RLS em todas as tabelas
alter table profiles enable row level security;
alter table categories enable row level security;
alter table tags enable row level security;
alter table opportunities enable row level security;
alter table books enable row level security;
alter table book_chapters enable row level security;
alter table book_versions enable row level security;
alter table ai_generations enable row level security;
alter table learning_paths enable row level security;
alter table learning_path_modules enable row level security;
alter table learning_path_items enable row level security;
alter table settings enable row level security;

-- Perfis: cada um lê o próprio; admin gerencia todos
create policy "Usuário lê o próprio perfil" on profiles
  for select using (auth.uid() = id or is_admin());
create policy "Admin gerencia perfis" on profiles
  for all using (is_admin()) with check (is_admin());

-- Taxonomias: leitura pública, escrita admin
create policy "Leitura pública de categorias" on categories for select using (true);
create policy "Admin gerencia categorias" on categories
  for all using (is_admin()) with check (is_admin());
create policy "Leitura pública de tags" on tags for select using (true);
create policy "Admin gerencia tags" on tags
  for all using (is_admin()) with check (is_admin());

-- Oportunidades e configurações: somente admin
create policy "Admin gerencia oportunidades" on opportunities
  for all using (is_admin()) with check (is_admin());
create policy "Admin gerencia configurações" on settings
  for all using (is_admin()) with check (is_admin());

-- Livros
create policy "Leitura pública de livros publicados" on books
  for select using (status = 'PUBLISHED' or is_admin());
create policy "Admin gerencia books" on books
  for all using (is_admin()) with check (is_admin());

create policy "Leitura pública de capítulos publicados" on book_chapters
  for select using (
    exists (select 1 from books where books.id = book_chapters.book_id and books.status = 'PUBLISHED')
    or is_admin()
  );
create policy "Admin gerencia chapters" on book_chapters
  for all using (is_admin()) with check (is_admin());

create policy "Admin gerencia versões" on book_versions
  for all using (is_admin()) with check (is_admin());
create policy "Admin gerencia gerações de IA" on ai_generations
  for all using (is_admin()) with check (is_admin());

-- Trilhas
create policy "Leitura pública de trilhas publicadas" on learning_paths
  for select using (status = 'PUBLISHED' or is_admin());
create policy "Admin gerencia trilhas" on learning_paths
  for all using (is_admin()) with check (is_admin());

create policy "Leitura pública de módulos publicados" on learning_path_modules
  for select using (
    exists (select 1 from learning_paths p where p.id = learning_path_modules.path_id and p.status = 'PUBLISHED')
    or is_admin()
  );
create policy "Admin gerencia módulos" on learning_path_modules
  for all using (is_admin()) with check (is_admin());

create policy "Leitura pública de itens publicados" on learning_path_items
  for select using (
    exists (
      select 1 from learning_path_modules m
      join learning_paths p on p.id = m.path_id
      where m.id = learning_path_items.module_id and p.status = 'PUBLISHED'
    )
    or is_admin()
  );
create policy "Admin gerencia itens" on learning_path_items
  for all using (is_admin()) with check (is_admin());

-- Para tornar alguém admin:
-- update profiles set role = 'ADMIN' where email = 'voce@exemplo.com';
