import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function BreakingNewsTicker() {
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'header')
    .single();
  const showTicker = settings?.value?.show_breaking_ticker !== false;
  if (!showTicker) return null;

  const { data: items } = await supabase
    .from('breaking_news')
    .select('*')
    .eq('is_active', true)
    .or('scheduled_for.is.null,scheduled_for.lte.now()')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(10);

  const now = new Date().toISOString();
  const active = (items || []).filter((it) => !it.expires_at || it.expires_at > now);
  if (active.length === 0) return null;

  return (
    <div className="w-full bg-red-600 text-white border-b border-red-700 sticky top-16 z-30">
      <div className="max-w-7xl mx-auto px-4 h-10 flex items-center gap-3 overflow-hidden">
        <span className="shrink-0 inline-flex items-center gap-2 px-2.5 py-1 bg-white text-red-600 text-[10px] font-black uppercase tracking-widest rounded animate-pulse">
          <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
          Breaking
        </span>
        <div className="flex-1 overflow-hidden relative h-full flex items-center">
          <div className="flex items-center gap-8 animate-marquee whitespace-nowrap">
            {active.concat(active).map((it, i) => (
              <Link
                key={`${it.id}-${i}`}
                href={it.url || '#'}
                className="text-xs sm:text-sm font-medium hover:underline"
              >
                {it.text}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
