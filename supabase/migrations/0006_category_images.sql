-- Zen-G News — Diverse category-based images for existing articles
-- Run in Supabase SQL Editor

-- World
update public.articles a set featured_image = case (abs(hashtext(a.slug)) % 5)
  when 0 then 'https://images.unsplash.com/photo-1526470498-9ae73c665de8?w=1200&auto=format&fit=crop&q=80'
  when 1 then 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80'
  when 2 then 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=1200&auto=format&fit=crop&q=80'
  when 3 then 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&auto=format&fit=crop&q=80'
  else 'https://images.unsplash.com/photo-1488272690726-627c5b86b1c0?w=1200&auto=format&fit=crop&q=80'
end
where a.category_id = (select id from public.categories where slug = 'world');

-- Politics
update public.articles a set featured_image = case (abs(hashtext(a.slug)) % 5)
  when 0 then 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1200&auto=format&fit=crop&q=80'
  when 1 then 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200&auto=format&fit=crop&q=80'
  when 2 then 'https://images.unsplash.com/photo-1606166187734-a4cb74079037?w=1200&auto=format&fit=crop&q=80'
  when 3 then 'https://images.unsplash.com/photo-1605007493699-af65834f8a00?w=1200&auto=format&fit=crop&q=80'
  else 'https://images.unsplash.com/photo-1575320181282-9afab399332c?w=1200&auto=format&fit=crop&q=80'
end
where a.category_id = (select id from public.categories where slug = 'politics');

-- Business
update public.articles a set featured_image = case (abs(hashtext(a.slug)) % 5)
  when 0 then 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200&auto=format&fit=crop&q=80'
  when 1 then 'https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?w=1200&auto=format&fit=crop&q=80'
  when 2 then 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&auto=format&fit=crop&q=80'
  when 3 then 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80'
  else 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80'
end
where a.category_id = (select id from public.categories where slug = 'business');

-- Technology
update public.articles a set featured_image = case (abs(hashtext(a.slug)) % 5)
  when 0 then 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80'
  when 1 then 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&auto=format&fit=crop&q=80'
  when 2 then 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=80'
  when 3 then 'https://images.unsplash.com/photo-1550745165-690bcb5b4ad2?w=1200&auto=format&fit=crop&q=80'
  else 'https://images.unsplash.com/photo-1581090700227-1e37b190418e?w=1200&auto=format&fit=crop&q=80'
end
where a.category_id = (select id from public.categories where slug = 'technology');

-- Sports
update public.articles a set featured_image = case (abs(hashtext(a.slug)) % 5)
  when 0 then 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1200&auto=format&fit=crop&q=80'
  when 1 then 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200&auto=format&fit=crop&q=80'
  when 2 then 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&auto=format&fit=crop&q=80'
  when 3 then 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1200&auto=format&fit=crop&q=80'
  else 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1200&auto=format&fit=crop&q=80'
end
where a.category_id = (select id from public.categories where slug = 'sports');

-- Entertainment
update public.articles a set featured_image = case (abs(hashtext(a.slug)) % 5)
  when 0 then 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80'
  when 1 then 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80'
  when 2 then 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&auto=format&fit=crop&q=80'
  when 3 then 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=1200&auto=format&fit=crop&q=80'
  else 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=1200&auto=format&fit=crop&q=80'
end
where a.category_id = (select id from public.categories where slug = 'entertainment');

-- Top stories / default
update public.articles a set featured_image = case (abs(hashtext(a.slug)) % 5)
  when 0 then 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1200&auto=format&fit=crop&q=80'
  when 1 then 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&auto=format&fit=crop&q=80'
  when 2 then 'https://images.unsplash.com/photo-1554420473-b5da0e8c46a0?w=1200&auto=format&fit=crop&q=80'
  when 3 then 'https://images.unsplash.com/photo-1551184451-76b762941ad6?w=1200&auto=format&fit=crop&q=80'
  else 'https://images.unsplash.com/photo-1557992260-ec58e92789fc?w=1200&auto=format&fit=crop&q=80'
end
where a.category_id is null or a.category_id = (select id from public.categories where slug = 'top-stories');
