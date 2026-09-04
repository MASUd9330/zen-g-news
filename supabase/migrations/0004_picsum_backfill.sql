-- Zen-G News — Picsum backfill for articles without featured_image
-- Run in Supabase SQL Editor
-- This sets a deterministic Picsum URL for every article that has no real image,
-- so the site always shows a beautiful, consistent image per article.

update public.articles
set featured_image = 'https://picsum.photos/seed/' || encode(slug::bytea, 'escape') || '/1200/750'
where featured_image is null or featured_image = '';

-- Verify counts
select
  count(*) filter (where featured_image is not null) as with_image,
  count(*) filter (where featured_image is null) as without_image,
  count(*) as total
from public.articles;
