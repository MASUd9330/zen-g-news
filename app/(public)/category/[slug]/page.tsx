import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Header from '@/components/Header';
import BreakingNewsTicker from '@/components/BreakingNewsTicker';
import ArticleCard from '@/components/ArticleCard';
import type { Metadata } from 'next';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: cat } = await supabase.from('categories').select('name, description').eq('slug', slug).single();
  if (!cat) return { title: 'Not found' };
  return {
    title: `${cat.name} — Zen-G News`,
    description: cat.description || `Latest ${cat.name} news from Zen-G News.`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const [{ data: category }, { data: categories }, { data: articles }] = await Promise.all([
    supabase.from('categories').select('*').eq('slug', slug).single(),
    supabase.from('categories').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
    supabase.from('articles').select('*, categories(name, slug)').eq('status', 'published').order('published_at', { ascending: false }).limit(48),
  ]);

  if (!category) notFound();

  const filtered = (articles || []).filter((a) => a.category_id === category.id);

  return (
    <>
      <Header categories={categories || []} />
      <BreakingNewsTicker />
      <main className="max-w-7xl mx-auto px-4 py-8 w-full flex-1">
        <header className="mb-8 pb-6 border-b border-[var(--border-color)]">
          <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-bold mb-2">Category</p>
          <h1 className="headline-font text-4xl sm:text-5xl font-black tracking-tight">{category.name}</h1>
          {category.description && <p className="mt-3 text-neutral-500 max-w-2xl">{category.description}</p>}
          <p className="mt-3 text-xs text-neutral-500">{filtered.length} article{filtered.length === 1 ? '' : 's'}</p>
        </header>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((art) => (
              <ArticleCard key={art.slug} {...art} category={art.categories} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-neutral-500">
            <p>No articles in this category yet.</p>
          </div>
        )}
      </main>
    </>
  );
}
