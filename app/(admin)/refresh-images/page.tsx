'use client';
import { useState } from 'react';
import { Image as ImageIcon, RefreshCw, CheckCircle2, XCircle, ExternalLink, Loader2 } from 'lucide-react';

export default function RefreshImagesPage() {
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState(50);
  const [result, setResult] = useState<any>(null);

  const trigger = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/refresh-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit }),
      });
      const j = await res.json();
      setResult(j);
    } catch (e: any) {
      setResult({ ok: false, error: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-2 mb-2">
        <ImageIcon className="w-5 h-5 text-cyan-400" />
        <h1 className="text-2xl font-bold">Refresh Article Images</h1>
      </div>
      <p className="text-sm text-neutral-400 mb-6 max-w-2xl">
        Fetches each article&apos;s source URL and extracts the real <code className="text-cyan-400">og:image</code> or <code className="text-cyan-400">twitter:image</code>. Updates <code>featured_image</code> in the database so cards show the real source image.
      </p>

      <div className="flex items-end gap-3 mb-6">
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Limit</label>
          <input
            type="number"
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value) || 50)}
            min={1}
            max={200}
            className="w-24 px-3 py-2 bg-[#0B0E14] border border-neutral-800 rounded text-sm"
          />
        </div>
        <button
          onClick={trigger}
          disabled={loading}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded text-sm font-bold uppercase disabled:opacity-50 inline-flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {loading ? 'Fetching source pages…' : 'Run Image Refresh'}
        </button>
      </div>

      {result && (
        <div>
          {result.ok ? (
            <div className="p-4 bg-emerald-950/30 border border-emerald-900 rounded mb-4">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Done in {result.duration_ms}ms
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-sm">
                <Stat label="Attempted" value={result.attempted} />
                <Stat label="Updated" value={result.updated} color="text-emerald-400" />
                <Stat label="Failed" value={result.failed} color="text-rose-400" />
                <Stat label="Skipped" value={result.skipped} color="text-amber-400" />
              </div>
            </div>
          ) : (
            <div className="p-4 bg-rose-950/30 border border-rose-900 rounded mb-4 flex items-start gap-2 text-rose-400">
              <XCircle className="w-4 h-4 mt-0.5" />
              <div>
                <div className="font-semibold">Failed</div>
                <div className="text-xs">{result.error}</div>
              </div>
            </div>
          )}

          {result.results && result.results.length > 0 && (
            <div className="bg-[#12151C] border border-neutral-800 rounded overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-[#0B0E14] text-[10px] uppercase tracking-widest text-neutral-500">
                  <tr><th className="text-left p-2">Slug</th><th>Status</th><th>Image / Reason</th></tr>
                </thead>
                <tbody>
                  {result.results.map((r: any, i: number) => (
                    <tr key={i} className="border-t border-neutral-800">
                      <td className="p-2 font-mono text-[10px] truncate max-w-[180px]">{r.slug}</td>
                      <td className="p-2">
                        <span className={`text-[10px] font-bold uppercase ${
                          r.status === 'updated' ? 'text-emerald-400' :
                          r.status === 'no_image' ? 'text-amber-400' :
                          r.status === 'skipped' ? 'text-neutral-500' : 'text-rose-400'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="p-2 text-neutral-400 truncate max-w-[280px]">
                        {r.image ? (
                          <a href={r.image} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline inline-flex items-center gap-1">
                            {r.image.slice(0, 60)}... <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : r.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color = 'text-white' }: { label: string; value: number; color?: string }) {
  return (
    <div className="p-2 bg-[#0B0E14] border border-neutral-800 rounded">
      <div className="text-[10px] uppercase tracking-widest text-neutral-500">{label}</div>
      <div className={`text-2xl font-black ${color}`}>{value}</div>
    </div>
  );
}
