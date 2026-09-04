import { createClient } from '@/lib/supabase/server';
import Header from '@/components/Header';
import BreakingNewsTicker from '@/components/BreakingNewsTicker';
import ArticleCard from '@/components/ArticleCard';
import { Search } from 'lucide-react';

export const revalidate = 60;

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const { q = '', category = '' } = await searchParams;
  const supabase = await createClient();

  const [{ data: categories }, { data: results }] = await Promise.all([
    supabase.from('categories').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
    (() => {
      let query = supabase.from('articles').select('*, categories(name, slug)').eq('status', 'published');
      if (q) query = query.or(`title.ilike.%${q}%,excerpt.ilike.%${q}%,content.ilike.%${q}%`);
      if (category) query = query.eq('category_id', category);
      return query.order('published_at', { ascending: false }).limit(48);
    })(),
  ]);

  return (
    <>
      <Header categories={categories || []} />
      <BreakingNewsTicker />
      <main className="max-w-7xl mx-auto px-4 py-8 w-full flex-1">
        <h1 className="headline-font text-3xl font-black mb-6">Search</h1>

        <form action="/search" method="get" className="mb-6">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center gap-2 px-4 py-3 border border-[var(--border-color)] rounded bg-[var(--bg-primary)]">
              <Search className="w-4 h-4 text-neutral-400" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Search headlines, keywords..."
                className="flex-1 bg-transparent outline-none text-sm"
              />
            </div>
            <select
              name="category"
              defaultValue={category}
              className="px-4 py-3 border border-[var(--border-color)] rounded bg-[var(--bg-primary)] text-sm"
            >
              <option value="">All categories</option>
              {(categories || []).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <button type="submit" className="px-6 py-3 bg-[var(--accent)] text-white text-sm font-semibold rounded hover:opacity-90">
              Search
            </button>
          </div>
        </form>

        <p className="text-sm text-neutral-500 mb-6">
          {results?.length || 0} result{(results?.length || 0) === 1 ? '' : 's'} {q && <>for "<span className="font-semibold text-neutral-900 dark:text-white">{q}</span>"</>}
        </p>

        {results && results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {results.map((art) => (
              <ArticleCard key={art.slug} {...art} category={art.categories} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-neutral-500">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No articles found. Try a different query.</p>
          </div>
        )}
      </main>
    </>
  );
}
