import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = await createClient();
  const [{ count: articles }, { count: drafts }] = await Promise.all([
    supabase.from('articles').select('*', { count: 'exact', head: true }),
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'draft')
  ]);

  return (
    <div className="p-8 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Newsroom Operations</h1>
        <Link href="/admin/news/add" className="px-4 py-2 bg-blue-600 rounded text-xs font-bold uppercase">+ Add Article</Link>
      </div>
      <div className="grid grid-cols-2 gap-4 max-w-lg">
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded">
          <div className="text-xs text-neutral-400">Total Articles</div>
          <div className="text-3xl font-black">{articles || 0}</div>
        </div>
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded">
          <div className="text-xs text-neutral-400">Pending Drafts</div>
          <div className="text-3xl font-black text-amber-400">{drafts || 0}</div>
        </div>
      </div>
    </div>
  );
}
