import { createClient } from '@/lib/supabase/server';
import Header from '@/components/Header';
import ArticleCard from '@/components/ArticleCard';
import AdSlot from '@/components/AdSlot';
import Link from 'next/link';

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();
  const [
    { data: categories },
    { data: articles },
    { data: ads }
  ] = await Promise.all([
    supabase.from('categories').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
    supabase.from('articles').select('*, categories(name, slug)').eq('status', 'published').order('published_at', { ascending: false }).limit(12),
    supabase.from('ad_placements').select('*').eq('is_active', true)
  ]);

  const topAd = ads?.find(a => a.placement_key === 'homepage_top');
  const hero = articles?.[0];
  const rest = articles?.slice(1) || [];

  return (
    <>
      <Header categories={categories || []} />
      <main className="max-w-7xl mx-auto px-4 py-6 w-full flex-1">
        <AdSlot placement={topAd} />
        {hero && (
          <section className="mb-10 pb-8 border-b border-[var(--border-color)]">
            <h1 className="headline-font font-black text-3xl sm:text-5xl mb-4 hover:text-[var(--accent)]">
              <Link href={`/article/${hero.slug}`}>{hero.title}</Link>
            </h1>
            <p className="text-neutral-500 text-sm sm:text-base max-w-3xl mb-4">{hero.excerpt}</p>
          </section>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {rest.map((art) => (
            <ArticleCard key={art.slug} {...art} category={art.categories} />
          ))}
        </div>
      </main>
    </>
  );
}
