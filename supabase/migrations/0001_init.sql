-- Zen-G News — Supabase Database Schema
-- Run this ONCE in: Supabase Dashboard → SQL Editor → New query → paste → Run
-- Generated: 2026-09-04

-- ============================================================
-- 1. profiles (linked to auth.users; holds role for admin gating)
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'editor' check (role in ('admin','editor','author')),
  created_at timestamptz not null default now()
);

-- Auto-create a profile row on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
create policy "profiles read for self" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles update for self" on public.profiles
  for update using (auth.uid() = id);

-- ============================================================
-- 2. categories
-- ============================================================
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.categories enable row level security;
create policy "categories public read" on public.categories
  for select using (true);
create policy "categories write for admin/editor" on public.categories
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','editor'))
  );

-- ============================================================
-- 3. sources (RSS feeds)
-- ============================================================
create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  endpoint_url text not null,
  default_category_id uuid references public.categories(id) on delete set null,
  auto_publish_trusted boolean not null default false,
  active boolean not null default true,
  last_polled_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);
alter table public.sources enable row level security;
create policy "sources admin only" on public.sources
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ============================================================
-- 4. articles
-- ============================================================
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  featured_image text,
  category_id uuid references public.categories(id) on delete set null,
  source_id uuid references public.sources(id) on delete set null,
  source_url text,
  author_name text,
  reading_time_minutes int default 2,
  status text not null default 'draft' check (status in ('draft','scheduled','published','archived')),
  dedup_hash text unique,
  published_at timestamptz,
  scheduled_for timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists articles_status_published_at_idx
  on public.articles (status, published_at desc);
create index if not exists articles_category_idx
  on public.articles (category_id);

alter table public.articles enable row level security;
create policy "articles public read published" on public.articles
  for select using (status = 'published');
create policy "articles write for editor+" on public.articles
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','editor','author'))
  );

-- ============================================================
-- 5. site_settings (key/value, e.g. branding.accent_color)
-- ============================================================
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;
create policy "settings public read" on public.site_settings
  for select using (true);
create policy "settings write for admin" on public.site_settings
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Seed default branding
insert into public.site_settings (key, value) values
  ('branding', '{"accent_color": "#2563EB", "site_name": "Zen-G News", "tagline": "Your World. Your News. Instantly."}'::jsonb)
  on conflict (key) do nothing;

-- ============================================================
-- 6. ad_placements
-- ============================================================
create table if not exists public.ad_placements (
  id uuid primary key default gen_random_uuid(),
  placement_key text not null unique,
  is_active boolean not null default false,
  html_code text,
  js_code text,
  css_code text,
  created_at timestamptz not null default now()
);
alter table public.ad_placements enable row level security;
create policy "ads public read active" on public.ad_placements
  for select using (is_active = true);
create policy "ads write for admin" on public.ad_placements
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Seed homepage top ad slot (inactive by default)
insert into public.ad_placements (placement_key, is_active) values
  ('homepage_top', false)
  on conflict (placement_key) do nothing;

-- ============================================================
-- 7. seed categories
-- ============================================================
insert into public.categories (name, slug, sort_order) values
  ('Top Stories', 'top-stories', 0),
  ('World', 'world', 10),
  ('Politics', 'politics', 20),
  ('Business', 'business', 30),
  ('Technology', 'technology', 40),
  ('Sports', 'sports', 50),
  ('Entertainment', 'entertainment', 60),
  ('Lifestyle', 'lifestyle', 70),
  ('Science', 'science', 80)
  on conflict (slug) do nothing;
