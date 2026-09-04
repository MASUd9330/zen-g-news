import Link from 'next/link';
import Image from 'next/image';
import { TrendingUp } from 'lucide-react';

export default function TrendingList({ items = [] }: { items: any[] }) {
  if (!items || items.length === 0) return null;

  return (
    <section className="py-10 border-t border-[var(--border-color)]">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-[var(--accent)]" />
        <h2 className="headline-font text-2xl font-black tracking-tight">Trending Now</h2>
        <span className="text-xs text-neutral-500 ml-2">Most read this week</span>
      </div>
      <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
        {items.slice(0, 5).map((a, i) => (
          <li key={a.id} className="group flex flex-col">
            <span className="text-3xl font-black text-[var(--accent)] opacity-30 leading-none mb-2">
              {String(i + 1).padStart(2, '0')}
            </span>
            <Link href={`/article/${a.slug}`} className="block relative aspect-[16/10] overflow-hidden rounded bg-neutral-200 dark:bg-neutral-800 mb-2">
              {a.featured_image ? (
                <Image
                  src={a.featured_image}
                  alt={a.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 20vw"
                  className="object-cover transition-transform duration-200 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-500 text-xs">Zen-G News</div>
              )}
            </Link>
            <h3 className="text-sm font-semibold leading-snug group-hover:text-[var(--accent)] transition-colors line-clamp-3">
              <Link href={`/article/${a.slug}`}>{a.title}</Link>
            </h3>
            {a.categories?.name && (
              <span className="text-[10px] uppercase tracking-widest text-neutral-500 mt-1">{a.categories.name}</span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
