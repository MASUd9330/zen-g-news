import { createClient } from '@/lib/supabase/server';
import Header from '@/components/Header';
import BreakingNewsTicker from '@/components/BreakingNewsTicker';
import TrendingList from '@/components/TrendingList';
import ArticleCard from '@/components/ArticleCard';
import AdSlot from '@/components/AdSlot';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, ArrowRight } from 'lucide-react';

export const revalidate = 60;

function timeAgo(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default async function HomePage() {
  const supabase = await createClient();
  const [
    { data: categories },
    { data: allArticles },
    { data: trending },
    { data: ads },
  ] = await Promise.all([
    supabase.from('categories').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
    supabase.from('articles')
      .select('*, categories(name, slug)')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(24),
    supabase.from('articles')
      .select('*, categories(name, slug)')
      .eq('status', 'published')
      .eq('is_trending', true)
      .order('view_count', { ascending: false })
      .limit(5),
    supabase.from('ad_placements').select('*').eq('is_active', true),
  ]);

  const topAd = ads?.find(a => a.placement_key === 'homepage_top');
  const middleAd = ads?.find(a => a.placement_key === 'homepage_middle');
  const headerAd = ads?.find(a => a.placement_key === 'header');

  const hero = allArticles?.[0];
  const sideStories = allArticles?.slice(1, 4) || [];
  const latest = allArticles?.slice(4, 12) || [];
  const rest = allArticles?.slice(12) || [];

  return (
    <>
      <Header categories={categories || []} />
      <BreakingNewsTicker />
      <main className="max-w-7xl mx-auto px-4 py-6 w-full flex-1">
        <AdSlot placement={headerAd} />

        {/* HERO SECTION */}
        {hero && (
          <section className="mb-10 pb-8 border-b border-[var(--border-color)]">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Link href={`/article/${hero.slug}`} className="lg:col-span-2 group block">
                <div className="relative aspect-[16/10] overflow-hidden rounded bg-neutral-200 dark:bg-neutral-800 mb-4">
                  {hero.featured_image && (
                    <Image
                      src={hero.featured_image}
                      alt={hero.title}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                  {hero.categories && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] uppercase font-bold rounded bg-[var(--accent)] text-white">
                      {hero.categories.name}
                    </span>
                  )}
                </div>
                <h1 className="headline-font font-black text-2xl sm:text-4xl leading-tight mb-3 group-hover:text-[var(--accent)] transition-colors">
                  {hero.title}
                </h1>
                {hero.excerpt && (
                  <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 line-clamp-3 mb-3">{hero.excerpt}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-neutral-500">
                  <span className="font-medium">{hero.author_name || 'Editorial'}</span>
                  <span>·</span>
                  <span>{timeAgo(hero.published_at)}</span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{hero.reading_time_minutes || 2}m</span>
                </div>
              </Link>

              <div className="flex flex-col gap-4">
                {sideStories.map((a) => (
                  <Link key={a.id} href={`/article/${a.slug}`} className="group flex gap-3 pb-4 border-b border-[var(--border-color)] last:border-0">
                    <div className="relative w-24 h-20 shrink-0 overflow-hidden rounded bg-neutral-200 dark:bg-neutral-800">
                      {a.featured_image && (
                        <Image src={a.featured_image} alt={a.title} fill sizes="96px" className="object-cover transition-transform duration-200 group-hover:scale-105" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      {a.categories && (
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--accent)]">{a.categories.name}</span>
                      )}
                      <h3 className="text-sm font-semibold leading-snug line-clamp-3 group-hover:text-[var(--accent)] transition-colors mt-1">{a.title}</h3>
                      <span className="text-[11px] text-neutral-500 mt-1 inline-block">{timeAgo(a.published_at)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* TRENDING */}
        {trending && trending.length > 0 && <TrendingList items={trending} />}

        {/* LATEST NEWS */}
        {latest.length > 0 && (
          <section className="py-10 border-t border-[var(--border-color)]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="headline-font text-2xl font-black tracking-tight">Latest News</h2>
              <Link href="/search" className="text-xs font-semibold text-[var(--accent)] inline-flex items-center gap-1 hover:gap-2 transition-all">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {latest.map((art) => (
                <ArticleCard key={art.slug} {...art} category={art.categories} />
              ))}
            </div>
          </section>
        )}

        <AdSlot placement={middleAd} />

        {/* CATEGORY SECTIONS */}
        {(categories || []).slice(0, 4).map((cat) => {
          const sectionArticles = (allArticles || []).filter(a => a.category_id === cat.id).slice(0, 4);
          if (sectionArticles.length === 0) return null;
          return (
            <section key={cat.id} className="py-10 border-t border-[var(--border-color)]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="headline-font text-2xl font-black tracking-tight">{cat.name}</h2>
                <Link href={`/category/${cat.slug}`} className="text-xs font-semibold text-[var(--accent)] inline-flex items-center gap-1 hover:gap-2 transition-all">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {sectionArticles.map((art) => (
                  <ArticleCard key={art.slug} {...art} category={art.categories} />
                ))}
              </div>
            </section>
          );
        })}

        {/* REMAINING */}
        {rest.length > 0 && (
          <section className="py-10 border-t border-[var(--border-color)]">
            <h2 className="headline-font text-2xl font-black tracking-tight mb-6">More Stories</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {rest.map((art) => (
                <ArticleCard key={art.slug} {...art} category={art.categories} />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
