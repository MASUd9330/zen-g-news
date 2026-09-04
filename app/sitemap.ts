import { createClient } from '@/lib/supabase/server';
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const base = 'https://zen-g-news.netlify.app';
  const [{ data: articles }, { data: categories }] = await Promise.all([
    supabase.from('articles').select('slug, updated_at, published_at').eq('status', 'published'),
    supabase.from('categories').select('slug'),
  ]);

  return [
    { url: base, lastModified: new Date(), changeFrequency: 'hourly', priority: 1 },
    { url: `${base}/search`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.5 },
    ...(categories || []).map((c) => ({
      url: `${base}/category/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.8,
    })),
    ...(articles || []).map((a) => ({
      url: `${base}/article/${a.slug}`,
      lastModified: new Date(a.updated_at || a.published_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ];
}
