import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Rss, Plus, Power, Trash2 } from 'lucide-react';

async function addSource(formData: FormData) {
  'use server';
  const supabase = await createClient();
  const name = formData.get('name') as string;
  const endpoint_url = formData.get('endpoint_url') as string;
  const category = (formData.get('category') as string) || null;
  const auto = formData.get('auto_publish') === 'on';
  if (!name || !endpoint_url) return;
  await supabase.from('sources').insert({
    name, endpoint_url,
    default_category_id: category || null,
    auto_publish_trusted: auto,
    active: true,
  });
  revalidatePath('/admin/sources');
}

async function toggleSource(id: string, current: boolean) {
  'use server';
  const supabase = await createClient();
  await supabase.from('sources').update({ active: !current }).eq('id', id);
  revalidatePath('/admin/sources');
}

async function deleteSource(id: string) {
  'use server';
  const supabase = await createClient();
  await supabase.from('sources').delete().eq('id', id);
  revalidatePath('/admin/sources');
}

export default async function SourcesPage() {
  const supabase = await createClient();
  const [{ data: sources }, { data: categories }] = await Promise.all([
    supabase.from('sources').select('*, categories(name)').order('created_at', { ascending: false }),
    supabase.from('categories').select('id, name').order('name'),
  ]);

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center gap-2 mb-6">
        <Rss className="w-5 h-5 text-cyan-400" />
        <h1 className="text-2xl font-bold">RSS Sources</h1>
      </div>

      <form action={addSource} className="mb-8 p-5 bg-[#12151C] border border-neutral-800 rounded">
        <h2 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2"><Plus className="w-4 h-4" /> Add new source</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input name="name" required placeholder="Source name" className="px-3 py-2 bg-[#0B0E14] border border-neutral-800 rounded text-sm focus:border-cyan-500 outline-none" />
          <input name="endpoint_url" required type="url" placeholder="https://example.com/feed.xml" className="px-3 py-2 bg-[#0B0E14] border border-neutral-800 rounded text-sm focus:border-cyan-500 outline-none" />
          <select name="category" className="px-3 py-2 bg-[#0B0E14] border border-neutral-800 rounded text-sm focus:border-cyan-500 outline-none">
            <option value="">— Default category (optional) —</option>
            {(categories || []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <label className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-300">
            <input type="checkbox" name="auto_publish" defaultChecked className="rounded" />
            Auto-publish trusted
          </label>
        </div>
        <button type="submit" className="mt-3 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded text-xs font-bold uppercase">Add source</button>
      </form>

      <h2 className="text-sm font-bold uppercase tracking-widest mb-3">All sources ({sources?.length || 0})</h2>
      <div className="bg-[#12151C] border border-neutral-800 rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#0B0E14] text-[10px] uppercase tracking-widest text-neutral-500">
            <tr><th className="text-left p-3">Name</th><th className="text-left p-3 hidden md:table-cell">URL</th><th className="text-left p-3 hidden md:table-cell">Category</th><th className="text-left p-3">Status</th><th className="text-right p-3">Actions</th></tr>
          </thead>
          <tbody>
            {(sources || []).map((s) => (
              <tr key={s.id} className="border-t border-neutral-800">
                <td className="p-3 font-medium">{s.name}</td>
                <td className="p-3 hidden md:table-cell text-xs text-neutral-500 truncate max-w-xs">{s.endpoint_url}</td>
                <td className="p-3 hidden md:table-cell text-xs">{s.categories?.name || '—'}</td>
                <td className="p-3">
                  <span className={`text-[10px] uppercase font-bold ${s.active ? 'text-emerald-400' : 'text-neutral-500'}`}>
                    {s.active ? '● Active' : '○ Off'}
                  </span>
                </td>
                <td className="p-3 text-right space-x-1">
                  <form action={toggleSource.bind(null, s.id, s.active)} className="inline">
                    <button type="submit" className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-[10px] font-bold uppercase"><Power className="w-3 h-3 inline" /> Toggle</button>
                  </form>
                  <form action={deleteSource.bind(null, s.id)} className="inline">
                    <button type="submit" className="px-2 py-1 bg-rose-600 hover:bg-rose-500 rounded text-[10px] font-bold uppercase"><Trash2 className="w-3 h-3" /></button>
                  </form>
                </td>
              </tr>
            ))}
            {(!sources || sources.length === 0) && (
              <tr><td colSpan={5} className="p-10 text-center text-neutral-500 text-sm">No sources yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
