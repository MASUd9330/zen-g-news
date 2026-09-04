-- Zen-G News — Premium Features Schema
-- Run AFTER 0001_init.sql and 0002_sources.sql

-- ============================================================
-- 1. breaking_news (admin-controlled ticker items)
-- ============================================================
create table if not exists public.breaking_news (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  url text,
  priority int not null default 0,
  is_active boolean not null default true,
  scheduled_for timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists breaking_news_active_idx
  on public.breaking_news (is_active, priority desc, created_at desc);

alter table public.breaking_news enable row level security;
create policy "breaking public read active" on public.breaking_news
  for select using (is_active = true);
create policy "breaking write for admin" on public.breaking_news
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ============================================================
-- 2. article_views (for trending)
-- ============================================================
create table if not exists public.article_views (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  viewer_hash text
);
create index if not exists article_views_article_idx on public.article_views (article_id);
create index if not exists article_views_viewed_at_idx on public.article_views (viewed_at desc);

alter table public.article_views enable row level security;
create policy "views insert public" on public.article_views
  for insert with check (true);
create policy "views read admin" on public.article_views
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','editor'))
  );

-- Add view_count denormalized counter to articles for fast queries
alter table public.articles
  add column if not exists view_count bigint not null default 0,
  add column if not exists is_featured boolean not null default false,
  add column if not exists is_trending boolean not null default false;

-- ============================================================
-- 3. newsletter_subscribers
-- ============================================================
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text not null unique,
  is_active boolean not null default true,
  subscribed_at timestamptz not null default now()
);
alter table public.newsletter_subscribers enable row level security;
create policy "newsletter insert public" on public.newsletter_subscribers
  for insert with check (true);
create policy "newsletter read admin" on public.newsletter_subscribers
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ============================================================
-- 4. site_settings — extended keys
-- ============================================================
insert into public.site_settings (key, value) values
  ('header', '{
    "show_breaking_ticker": true,
    "show_utility_bar": true,
    "show_weather": false,
    "show_live_indicator": true,
    "weather_location": "Dhaka"
  }'::jsonb),
  ('social', '{
    "facebook_url": "",
    "twitter_url": "",
    "telegram_url": "",
    "youtube_url": "",
    "linkedin_url": ""
  }'::jsonb),
  ('seo', '{
    "home_title": "Zen-G News — Your World. Your News. Instantly.",
    "home_description": "Unbiased, fast, and verified breaking news from around the world.",
    "google_verification": "",
    "bing_verification": "",
    "google_analytics_id": "",
    "facebook_pixel_id": ""
  }'::jsonb),
  ('auto_share', '{
    "enabled": false,
    "facebook_enabled": false,
    "telegram_enabled": false,
    "telegram_bot_token": "",
    "telegram_chat_id": "",
    "template": "🔥 {title}\n\n{description}\n\nRead more: {url}\n\n#ZenGNews #{category}"
  }'::jsonb)
  on conflict (key) do nothing;

-- ============================================================
-- 5. helper function: increment view count
-- ============================================================
create or replace function public.record_article_view(article_uuid uuid)
returns void language plpgsql security definer as $$
begin
  update public.articles
    set view_count = view_count + 1,
        is_trending = case when view_count + 1 > 50 then true else is_trending end
    where id = article_uuid;
  insert into public.article_views (article_id) values (article_uuid);
end;
$$;
grant execute on function public.record_article_view(uuid) to anon, authenticated;

-- ============================================================
-- 6. default ad placements
-- ============================================================
insert into public.ad_placements (placement_key, is_active) values
  ('header', false),
  ('homepage_top', false),
  ('homepage_middle', false),
  ('homepage_bottom', false),
  ('article_top', false),
  ('article_inline', false),
  ('article_sidebar', false),
  ('article_bottom', false),
  ('between_cards', false),
  ('footer', false)
  on conflict (placement_key) do nothing;
