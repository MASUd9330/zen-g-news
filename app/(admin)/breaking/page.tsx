import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Zap, Plus, Power, Trash2 } from 'lucide-react';

async function addItem(formData: FormData) {
  'use server';
  const supabase = await createClient();
  const text = formData.get('text') as string;
  const url = formData.get('url') as string;
  const priority = parseInt((formData.get('priority') as string) || '0', 10);
  if (!text) return;
  await supabase.from('breaking_news').insert({ text, url: url || null, priority, is_active: true });
  revalidatePath('/admin/breaking');
  revalidatePath('/');
}

async function toggleItem(id: string, currentState: boolean) {
  'use server';
  const supabase = await createClient();
  await supabase.from('breaking_news').update({ is_active: !currentState }).eq('id', id);
  revalidatePath('/admin/breaking');
  revalidatePath('/');
}

async function deleteItem(id: string) {
  'use server';
  const supabase = await createClient();
  await supabase.from('breaking_news').delete().eq('id', id);
  revalidatePath('/admin/breaking');
  revalidatePath('/');
}

export default async function BreakingNewsPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from('breaking_news')
    .select('*')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false });

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-2 mb-6">
        <Zap className="w-5 h-5 text-rose-500" />
        <h1 className="text-2xl font-bold">Breaking News</h1>
      </div>

      <form action={addItem} className="mb-8 p-5 bg-[#12151C] border border-neutral-800 rounded">
        <h2 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2"><Plus className="w-4 h-4" /> Add new</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input name="text" required placeholder="Breaking news text..." className="md:col-span-2 px-3 py-2 bg-[#0B0E14] border border-neutral-800 rounded text-sm focus:border-blue-500 outline-none" />
          <input name="url" type="url" placeholder="https://... (optional link)" className="px-3 py-2 bg-[#0B0E14] border border-neutral-800 rounded text-sm focus:border-blue-500 outline-none" />
        </div>
        <div className="flex items-center gap-3 mt-3">
          <label className="text-xs text-neutral-400">Priority:</label>
          <input name="priority" type="number" defaultValue="0" className="w-20 px-2 py-1.5 bg-[#0B0E14] border border-neutral-800 rounded text-sm" />
          <button type="submit" className="ml-auto px-4 py-2 bg-rose-600 hover:bg-rose-500 rounded text-xs font-bold uppercase">Publish</button>
        </div>
      </form>

      <h2 className="text-sm font-bold uppercase tracking-widest mb-3">Active items ({items?.length || 0})</h2>
      <ul className="space-y-2">
        {(items || []).map((it) => (
          <li key={it.id} className="flex items-center gap-3 p-4 bg-[#12151C] border border-neutral-800 rounded">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{it.text}</p>
              <div className="flex items-center gap-3 text-[10px] text-neutral-500 mt-1">
                <span>Priority: {it.priority}</span>
                {it.url && <a href={it.url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline truncate max-w-xs">{it.url}</a>}
                <span>{new Date(it.created_at).toLocaleString()}</span>
              </div>
            </div>
            <form action={toggleItem.bind(null, it.id, it.is_active)}>
              <button type="submit" className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${it.is_active ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-neutral-700 hover:bg-neutral-600'}`}>
                <Power className="w-3 h-3 inline" /> {it.is_active ? 'On' : 'Off'}
              </button>
            </form>
            <form action={deleteItem.bind(null, it.id)}>
              <button type="submit" className="px-2 py-1 bg-rose-600 hover:bg-rose-500 rounded text-[10px] font-bold uppercase">
                <Trash2 className="w-3 h-3" />
              </button>
            </form>
          </li>
        ))}
        {(!items || items.length === 0) && (
          <li className="text-center py-10 text-neutral-500 text-sm">No breaking news yet. Add one above.</li>
        )}
      </ul>
    </div>
  );
}
