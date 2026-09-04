import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Header from '@/components/Header';
import Image from 'next/image';

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const [{ data: article }, { data: categories }] = await Promise.all([
    supabase.from('articles').select('*, categories(name, slug)').eq('slug', slug).eq('status', 'published').single(),
    supabase.from('categories').select('*').eq('is_active', true)
  ]);

  if (!article) notFound();

  return (
    <>
      <Header categories={categories || []} />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="headline-font font-black text-3xl sm:text-5xl mb-4">{article.title}</h1>
        <p className="text-sm text-neutral-500 mb-6">By {article.author_name} • {new Date(article.published_at).toLocaleDateString()}</p>
        {article.featured_image && (
          <div className="relative aspect-[16/9] w-full rounded overflow-hidden mb-6 bg-neutral-800">
            <Image src={article.featured_image} alt={article.title} fill className="object-cover" />
          </div>
        )}
        <div className="prose dark:prose-invert max-w-none text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: article.content }} />
      </main>
    </>
  );
}
