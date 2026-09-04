-- Zen-G News — Bangla (Bengali) language support
-- Run in Supabase SQL Editor

-- 1. Add name_bn column to categories
alter table public.categories
  add column if not exists name_bn text;

-- 2. Populate Bangla names for existing categories
update public.categories set name_bn = 'শীর্ষ খবর' where slug = 'top-stories';
update public.categories set name_bn = 'বিশ্ব' where slug = 'world';
update public.categories set name_bn = 'রাজনীতি' where slug = 'politics';
update public.categories set name_bn = 'ব্যবসা' where slug = 'business';
update public.categories set name_bn = 'প্রযুক্তি' where slug = 'technology';
update public.categories set name_bn = 'খেলা' where slug = 'sports';
update public.categories set name_bn = 'বিনোদন' where slug = 'entertainment';
update public.categories set name_bn = 'জীবনযাপন' where slug = 'lifestyle';
update public.categories set name_bn = 'বিজ্ঞান' where slug = 'science';
update public.categories set name_bn = 'স্বাস্থ্য' where slug = 'health';
update public.categories set name_bn = 'বাংলাদেশ' where slug = 'bangladesh';

-- 3. Add Bangla tag-line to site settings
update public.site_settings
set value = value || jsonb_build_object('tagline_bn', 'আপনার বিশ্ব। আপনার সংবাদ। তাৎক্ষণিক।')
where key = 'branding';
