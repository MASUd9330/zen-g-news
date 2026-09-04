import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Header from '@/components/Header';
import BreakingNewsTicker from '@/components/BreakingNewsTicker';
import ShareButtons from '@/components/ShareButtons';
import SafeImage from '@/components/SafeImage';
import AdSlot from '@/components/AdSlot';
import { imageForArticle } from '@/lib/images';
import Link from 'next/link';
import { Clock, User, Calendar, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: article } = await supabase
    .from('articles')
    .select('title, excerpt, featured_image, categories(name)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
  if (!article) return { title: 'Not found' };
  return {
    title: `${article.title} — Zen-G News`,
    description: article.excerpt || '',
    openGraph: {
      title: article.title,
      description: article.excerpt || '',
      images: article.featured_image ? [article.featured_image] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt || '',
      images: article.featured_image ? [article.featured_image] : [],
    },
  };
}

function formatDate(iso?: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function articleJsonLd(article: any, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt,
    image: article.featured_image ? [article.featured_image] : [],
    datePublished: article.published_at,
    dateModified: article.updated_at || article.published_at,
    author: [{ '@type': 'Person', name: article.author_name || 'Editorial' }],
    publisher: {
      '@type': 'Organization',
      name: 'Zen-G News',
      logo: { '@type': 'ImageObject', url: 'https://zen-g-news.netlify.app/logo.png' },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const [{ data: article }, { data: categories }, { data: related }, { data: trending }, { data: latest }, { data: ads }] = await Promise.all([
    supabase.from('articles').select('*, categories(name, slug)').eq('slug', slug).eq('status', 'published').single(),
    supabase.from('categories').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
    supabase.from('articles').select('*, categories(name, slug)').eq('status', 'published').neq('slug', slug).order('published_at', { ascending: false }).limit(6),
    supabase.from('articles').select('id, title, slug, view_count').eq('status', 'published').eq('is_trending', true).order('view_count', { ascending: false }).limit(5),
    supabase.from('articles').select('id, title, slug, categories(name, slug)').eq('status', 'published').order('published_at', { ascending: false }).limit(5),
    supabase.from('ad_placements').select('*').eq('is_active', true),
  ]);

  if (!article) notFound();

  const articleImage = imageForArticle({ slug: article.slug, categories: article.categories, featured_image: article.featured_image });

  const sidebarAd = ads?.find((a) => a.placement_key === 'article_sidebar');
  const inlineAd = ads?.find((a) => a.placement_key === 'article_inline');
  const topAd = ads?.find((a) => a.placement_key === 'article_top');
  const bottomAd = ads?.find((a) => a.placement_key === 'article_bottom');

  const articleUrl = `https://zen-g-news.netlify.app/article/${article.slug}`;

  return (
    <>
      <Header categories={categories || []} />
      <BreakingNewsTicker />
      <main className="max-w-7xl mx-auto px-4 py-6 w-full flex-1">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(article, articleUrl)) }}
        />

        {/* Breadcrumb */}
        <nav className="text-xs text-neutral-500 mb-4 flex items-center gap-1.5">
          <Link href="/" className="hover:text-[var(--accent)]">Home</Link>
          <span>/</span>
          {article.categories && (
            <>
              <Link href={`/category/${article.categories.slug}`} className="hover:text-[var(--accent)]">{article.categories.name}</Link>
              <span>/</span>
            </>
          )}
          <span className="truncate max-w-xs">{article.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <article className="lg:col-span-2">
            {article.categories && (
              <Link href={`/category/${article.categories.slug}`} className="inline-block text-[10px] uppercase tracking-widest font-bold text-[var(--accent)] mb-3">
                {article.categories.name}
              </Link>
            )}
            <h1 className="headline-font font-black text-3xl sm:text-5xl leading-tight mb-4">{article.title}</h1>
            {article.excerpt && (
              <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed mb-5">{article.excerpt}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 pb-5 border-b border-[var(--border-color)] mb-5">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <User className="w-3.5 h-3.5" />{article.author_name || 'Editorial'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />{formatDate(article.published_at)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />{article.reading_time_minutes || 2} min read
              </span>
            </div>

            <AdSlot placement={topAd} />

            <figure className="mb-6 -mx-4 sm:mx-0">
              <div className="relative aspect-[16/9] overflow-hidden rounded sm:rounded-lg bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-800 dark:to-neutral-900">
                <SafeImage
                  src={article.featured_image}
                  seed={article.slug}
                  categoryImage={articleImage}
                  alt={article.title}
                  loading="eager"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="w-full h-full object-cover"
                />
              </div>
            </figure>

            <div
              className="prose prose-lg dark:prose-invert max-w-none 
                prose-headings:headline-font prose-headings:font-black 
                prose-p:leading-relaxed prose-p:mb-4
                prose-a:text-[var(--accent)] prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-lg"
              dangerouslySetInnerHTML={{ __html: article.content || '' }}
            />

            <AdSlot placement={inlineAd} />

            <div className="mt-8 pt-6 border-t border-[var(--border-color)]">
              <ShareButtons url={articleUrl} title={article.title} description={article.excerpt} />
            </div>

            <AdSlot placement={bottomAd} />

            {/* Related */}
            {related && related.length > 0 && (
              <section className="mt-12 pt-8 border-t border-[var(--border-color)]">
                <h2 className="headline-font text-2xl font-black tracking-tight mb-6">Related News</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {related.slice(0, 4).map((r) => (
                    <Link key={r.id} href={`/article/${r.slug}`} className="group flex gap-3">
                      <div className="relative w-28 h-20 shrink-0 overflow-hidden rounded bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-800 dark:to-neutral-900">
                        <SafeImage src={r.featured_image} seed={r.slug} alt={r.title} loading="lazy" sizes="112px" className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" />
                      </div>
                      <div className="flex-1 min-w-0">
                        {r.categories && <span className="text-[10px] uppercase font-bold text-[var(--accent)]">{r.categories.name}</span>}
                        <h3 className="text-sm font-semibold leading-snug line-clamp-3 group-hover:text-[var(--accent)] transition-colors mt-1">{r.title}</h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-8">
            <AdSlot placement={sidebarAd} />

            {trending && trending.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest border-b-2 border-[var(--accent)] pb-2 mb-4">Trending</h3>
                <ol className="space-y-3">
                  {trending.map((t, i) => (
                    <li key={t.id} className="flex gap-3">
                      <span className="text-2xl font-black text-[var(--accent)] opacity-40 leading-none">{String(i + 1).padStart(2, '0')}</span>
                      <Link href={`/article/${t.slug}`} className="text-sm font-semibold leading-snug hover:text-[var(--accent)] transition-colors line-clamp-3">
                        {t.title}
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {latest && latest.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest border-b-2 border-[var(--accent)] pb-2 mb-4">Latest</h3>
                <ul className="space-y-3">
                  {latest.map((l) => (
                    <li key={l.id} className="text-sm leading-snug">
                      <Link href={`/article/${l.slug}`} className="font-medium hover:text-[var(--accent)] transition-colors line-clamp-2">
                        {l.title}
                      </Link>
                      {(l.categories as any)?.name && <div className="text-[10px] uppercase text-neutral-500 mt-1">{(l.categories as any).name}</div>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </main>
    </>
  );
}
