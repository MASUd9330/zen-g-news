import Link from 'next/link';
import Image from 'next/image';
import { Clock } from 'lucide-react';

export default function ArticleCard({ title, slug, excerpt, featured_image, category, author_name, reading_time_minutes = 2, compact = false }: any) {
  return (
    <article className="group flex flex-col justify-between h-full">
      <div>
        <Link href={`/article/${slug}`} className="block relative aspect-[16/10] overflow-hidden rounded bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-800 dark:to-neutral-900 mb-3">
          {featured_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={featured_image}
              alt={title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500 dark:text-neutral-600">
              <div className="headline-font text-lg font-black tracking-tight opacity-30">ZEN-G<span className="text-[var(--accent)]">.</span>NEWS</div>
              <span className="text-[10px] uppercase tracking-widest mt-1">No image</span>
            </div>
          )}
          {category && (
            <span className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[10px] uppercase font-bold rounded bg-neutral-900/85 text-white backdrop-blur">
              {category.name}
            </span>
          )}
        </Link>
        <h3 className={`headline-font font-bold leading-snug group-hover:text-[var(--accent)] transition-colors ${compact ? 'text-sm mb-1.5' : 'text-lg mb-2'}`}>
          <Link href={`/article/${slug}`} className="line-clamp-2">{title}</Link>
        </h3>
        {!compact && excerpt && <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed mb-3">{excerpt}</p>}
      </div>
      <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-2 border-t border-[var(--border-color)]">
        <span className="truncate max-w-[120px] font-medium">{author_name || 'Editorial'}</span>
        <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{reading_time_minutes}m</span>
      </div>
    </article>
  );
}
