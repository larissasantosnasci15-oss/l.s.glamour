-- =========================================================================
-- L.S.GLAMOUR — schema do banco de dados (Supabase / Postgres)
-- =========================================================================
-- Como usar: abra o painel do Supabase > SQL Editor > New query, cole todo
-- este arquivo e clique em "Run". Ele é seguro para rodar mais de uma vez
-- (usa "if not exists" / "or replace" na maioria dos pontos).
-- =========================================================================

create extension if not exists "pgcrypto";

-- -------------------------------------------------------------------------
-- CATEGORIAS
-- -------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------------------
-- PRODUTOS
-- -------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category_id uuid references public.categories(id) on delete set null,
  brand text,
  description text default '',
  price numeric(10, 2) not null default 0,
  promo_price numeric(10, 2),
  stock int not null default 0,
  active boolean not null default true,
  is_promo boolean not null default false,
  is_launch boolean not null default false,
  is_featured boolean not null default false,
  is_bestseller boolean not null default false,
  image_url text,
  images text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_active_idx on public.products(active);

-- -------------------------------------------------------------------------
-- BANNERS (carrossel principal da home)
-- -------------------------------------------------------------------------
create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  subtitle text default '',
  button_text text default '',
  button_link text default '',
  image_url text,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------------------
-- CONFIGURAÇÕES DA LOJA (linha única, id fixo = 1)
-- -------------------------------------------------------------------------
create table if not exists public.settings (
  id int primary key default 1,
  store_name text not null default 'L.S.GLAMOUR',
  slogan text default '',
  description text default '',
  logo_url text,
  favicon_url text,
  whatsapp_number text default '',
  instagram text default '',
  tiktok text default '',
  email text default '',
  address text default '',
  hours text default '',
  payment_info text default '',
  shipping_info text default '',
  exchange_policy text default '',
  privacy_policy text default '',
  primary_color text default '#221E1F',
  secondary_color text default '#FBD7E6',
  button_color text default '#221E1F',
  font_choice text default 'glamour',
  constraint settings_singleton check (id = 1)
);

insert into public.settings (id, store_name, slogan, whatsapp_number)
values (1, 'L.S.Glamour', 'Sua beleza, seu estilo, seu glamour.', '')
on conflict (id) do nothing;

-- -------------------------------------------------------------------------
-- CATEGORIAS INICIAIS (somente as autorizadas pela loja)
-- -------------------------------------------------------------------------
insert into public.categories (name, slug, sort_order) values
  ('Perfumes', 'perfumes', 1),
  ('Body Splash', 'body-splash', 2),
  ('Skincare', 'skincare', 3),
  ('Cabelos', 'cabelos', 4),
  ('Roupas', 'roupas', 5),
  ('Semijoias', 'semijoias', 6),
  ('Bolsas', 'bolsas', 7),
  ('Promoções', 'promocoes', 8),
  ('Lançamentos', 'lancamentos', 9)
on conflict (slug) do nothing;

-- -------------------------------------------------------------------------
-- updated_at automático em produtos
-- -------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute procedure public.set_updated_at();

-- =========================================================================
-- SEGURANÇA (Row Level Security)
-- Regra: qualquer visitante pode LER produtos/categorias/banners/settings.
-- Somente um usuário autenticado (o administrador da loja, criado no
-- Supabase Auth) pode inserir, editar ou excluir.
-- =========================================================================
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.banners enable row level security;
alter table public.settings enable row level security;

drop policy if exists "public read categories" on public.categories;
create policy "public read categories" on public.categories
  for select using (true);

drop policy if exists "admin write categories" on public.categories;
create policy "admin write categories" on public.categories
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "public read products" on public.products;
create policy "public read products" on public.products
  for select using (true);

drop policy if exists "admin write products" on public.products;
create policy "admin write products" on public.products
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "public read banners" on public.banners;
create policy "public read banners" on public.banners
  for select using (true);

drop policy if exists "admin write banners" on public.banners;
create policy "admin write banners" on public.banners
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "public read settings" on public.settings;
create policy "public read settings" on public.settings
  for select using (true);

drop policy if exists "admin write settings" on public.settings;
create policy "admin write settings" on public.settings
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- =========================================================================
-- ARMAZENAMENTO DE IMAGENS (Supabase Storage)
-- Cria um bucket público "images" para fotos de produtos, banners e logo.
-- =========================================================================
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

drop policy if exists "public read images" on storage.objects;
create policy "public read images" on storage.objects
  for select using (bucket_id = 'images');

drop policy if exists "admin upload images" on storage.objects;
create policy "admin upload images" on storage.objects
  for insert with check (bucket_id = 'images' and auth.role() = 'authenticated');

drop policy if exists "admin update images" on storage.objects;
create policy "admin update images" on storage.objects
  for update using (bucket_id = 'images' and auth.role() = 'authenticated');

drop policy if exists "admin delete images" on storage.objects;
create policy "admin delete images" on storage.objects
  for delete using (bucket_id = 'images' and auth.role() = 'authenticated');
