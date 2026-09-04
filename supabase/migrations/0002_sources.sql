-- Zen-G News — 20 RSS Sources (10 Bangladesh + 10 International)
-- Run this AFTER 0001_init.sql in Supabase SQL Editor

-- Step 1: Add Bangladesh category
insert into public.categories (name, slug, sort_order) values
  ('Bangladesh', 'bangladesh', 5)
  on conflict (slug) do nothing;

-- Step 2: 10 Bangladesh sources
insert into public.sources (name, endpoint_url, default_category_id, auto_publish_trusted, active)
select * from (values
  ('Prothom Alo (English)', 'https://en.prothomalo.com/feed/', (select id from public.categories where slug = 'bangladesh'), true, true),
  ('The Daily Star', 'https://www.thedailystar.net/frontpage/rss.xml', (select id from public.categories where slug = 'bangladesh'), true, true),
  ('Dhaka Tribune', 'https://www.dhakatribune.com/feed', (select id from public.categories where slug = 'bangladesh'), true, true),
  ('bdnews24.com', 'https://bdnews24.com/feed/en', (select id from public.categories where slug = 'bangladesh'), true, true),
  ('Daily Sun', 'https://www.daily-sun.com/rss', (select id from public.categories where slug = 'bangladesh'), true, true),
  ('New Age BD', 'https://www.newagebd.net/feed/', (select id from public.categories where slug = 'bangladesh'), true, true),
  ('Financial Express BD', 'https://thefinancialexpress.com.bd/feed', (select id from public.categories where slug = 'business'), true, true),
  ('Business Standard BD', 'https://www.tbsnews.net/rss.xml', (select id from public.categories where slug = 'business'), true, true),
  ('The Independent BD', 'https://www.theindependentbd.com/rss.xml', (select id from public.categories where slug = 'bangladesh'), true, true),
  ('Daily Observer', 'https://www.observerbd.com/rss.xml', (select id from public.categories where slug = 'bangladesh'), true, true)
) as s(name, endpoint_url, default_category_id, auto_publish_trusted, active);

-- Step 3: 10 International sources
insert into public.sources (name, endpoint_url, default_category_id, auto_publish_trusted, active)
select * from (values
  ('BBC World', 'https://feeds.bbci.co.uk/news/world/rss.xml', (select id from public.categories where slug = 'world'), true, true),
  ('Reuters World', 'https://feeds.reuters.com/Reuters/worldNews', (select id from public.categories where slug = 'world'), true, true),
  ('Al Jazeera', 'https://www.aljazeera.com/xml/rss/all.xml', (select id from public.categories where slug = 'world'), true, true),
  ('AP News', 'https://feeds.apnews.com/rss/apf-topnews', (select id from public.categories where slug = 'world'), true, true),
  ('The Guardian World', 'https://www.theguardian.com/world/rss', (select id from public.categories where slug = 'world'), true, true),
  ('CNN Top Stories', 'http://rss.cnn.com/rss/edition.rss', (select id from public.categories where slug = 'top-stories'), true, true),
  ('TechCrunch', 'https://techcrunch.com/feed/', (select id from public.categories where slug = 'technology'), true, true),
  ('Ars Technica', 'https://feeds.arstechnica.com/arstechnica/index', (select id from public.categories where slug = 'technology'), true, true),
  ('ESPN Top Headlines', 'https://www.espn.com/espn/rss/news', (select id from public.categories where slug = 'sports'), true, true),
  ('BBC Technology', 'https://feeds.bbci.co.uk/news/technology/rss.xml', (select id from public.categories where slug = 'technology'), true, true)
) as s(name, endpoint_url, default_category_id, auto_publish_trusted, active);

-- Verify: list all sources with their categories
select s.name as source, c.name as category, s.active, s.auto_publish_trusted
from public.sources s
left join public.categories c on c.id = s.default_category_id
order by c.sort_order nulls last, s.name;
