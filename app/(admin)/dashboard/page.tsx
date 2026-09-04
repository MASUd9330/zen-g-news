import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { FileText, Edit3, Send, Eye, Zap, TrendingUp, Rss, Users } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const [
    { count: total },
    { count: published },
    { count: drafts },
    { count: scheduled },
    { count: breakingActive },
    { count: sourcesActive },
    { count: trending },
    { data: recent },
    { data: top },
  ] = await Promise.all([
    supabase.from('articles').select('*', { count: 'exact', head: true }),
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'scheduled'),
    supabase.from('breaking_news').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('sources').select('*', { count: 'exact', head: true }).eq('active', true),
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('is_trending', true),
    supabase.from('articles').select('id, title, status, view_count, published_at, categories(name)').order('published_at', { ascending: false }).limit(8),
    supabase.from('articles').select('id, title, view_count, categories(name)').eq('status', 'published').order('view_count', { ascending: false }).limit(5),
  ]);

  const stats = [
    { label: 'Total Articles', value: total || 0, icon: FileText, color: 'text-blue-400' },
    { label: 'Published', value: published || 0, icon: Send, color: 'text-emerald-400' },
    { label: 'Drafts', value: drafts || 0, icon: Edit3, color: 'text-amber-400' },
    { label: 'Scheduled', value: scheduled || 0, icon: Send, color: 'text-purple-400' },
    { label: 'Breaking Active', value: breakingActive || 0, icon: Zap, color: 'text-rose-400' },
    { label: 'RSS Sources', value: sourcesActive || 0, icon: Rss, color: 'text-cyan-400' },
    { label: 'Trending', value: trending || 0, icon: TrendingUp, color: 'text-orange-400' },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-neutral-400 mt-1">Welcome back. Here's what's happening today.</p>
        </div>
        <Link href="/admin/news/add" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-xs font-bold uppercase">+ Add Article</Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="p-4 bg-[#12151C] border border-neutral-800 rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-widest text-neutral-500">{s.label}</span>
                <Icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div className="text-2xl font-black">{s.value}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#12151C] border border-neutral-800 rounded p-5">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-3">Recent Articles</h2>
          {recent && recent.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {recent.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-1.5 border-b border-neutral-800 last:border-0">
                  <Link href={`/article/${a.id}`} className="truncate hover:text-blue-400 flex-1">{a.title}</Link>
                  <span className="text-[10px] uppercase text-neutral-500 shrink-0">{a.status}</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-xs text-neutral-500">No articles yet.</p>}
        </div>

        <div className="bg-[#12151C] border border-neutral-800 rounded p-5">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
            <Eye className="w-4 h-4" /> Top Viewed
          </h2>
          {top && top.length > 0 ? (
            <ol className="space-y-2 text-sm">
              {top.map((a, i) => (
                <li key={a.id} className="flex items-center gap-3 py-1.5 border-b border-neutral-800 last:border-0">
                  <span className="text-2xl font-black text-blue-500 opacity-50 w-8">{String(i + 1).padStart(2, '0')}</span>
                  <span className="truncate flex-1">{a.title}</span>
                  <span className="text-[10px] text-neutral-500 shrink-0">{a.view_count} views</span>
                </li>
              ))}
            </ol>
          ) : <p className="text-xs text-neutral-500">No views yet.</p>}
        </div>
      </div>
    </div>
  );
}
