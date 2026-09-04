'use client';
import { useState } from 'react';
import { RefreshCw, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function IngestTriggerPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const trigger = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/ingest', { method: 'POST' });
      const j = await res.json();
      setResult(j);
    } catch (e: any) {
      setResult({ ok: false, error: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">Manual RSS Ingest</h1>
      <p className="text-sm text-neutral-400 mb-6">
        Triggers an immediate fetch from all 20 active RSS sources. New articles will have real source images extracted from the feed (enclosure, media:content, media:thumbnail, og:image, or in-content &lt;img&gt;).
      </p>

      <button
        onClick={trigger}
        disabled={loading}
        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded text-sm font-bold uppercase disabled:opacity-50 inline-flex items-center gap-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        {loading ? 'Ingesting…' : 'Run Ingest Now'}
      </button>

      {result && (
        <div className="mt-6">
          {result.ok ? (
            <div className="p-4 bg-emerald-950/30 border border-emerald-900 rounded">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-3">
                <CheckCircle2 className="w-4 h-4" />
                Done — {result.total} new article(s) added across {result.sources?.length} source(s) in {result.duration_ms}ms
              </div>
              <div className="text-xs text-neutral-300">
                Real source images extracted: <strong>{result.images_extracted}</strong>
              </div>
              <details className="mt-3 text-xs">
                <summary className="cursor-pointer text-neutral-400 hover:text-white">Per-source breakdown</summary>
                <table className="mt-2 w-full text-left">
                  <thead className="text-[10px] uppercase text-neutral-500">
                    <tr><th className="py-1">Source</th><th>Fetched</th><th>Added</th><th>Images</th><th>Time</th><th>Error</th></tr>
                  </thead>
                  <tbody>
                    {result.sources?.map((s: any, i: number) => (
                      <tr key={i} className="border-t border-neutral-800">
                        <td className="py-1.5 pr-2 font-medium">{s.name}</td>
                        <td className="pr-2">{s.fetched}</td>
                        <td className="pr-2 text-emerald-400">{s.added}</td>
                        <td className="pr-2">{s.images_found}</td>
                        <td className="pr-2">{s.duration_ms}ms</td>
                        <td className="pr-2 text-rose-400">{s.error || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            </div>
          ) : (
            <div className="p-4 bg-rose-950/30 border border-rose-900 rounded flex items-start gap-2 text-rose-400">
              <XCircle className="w-4 h-4 mt-0.5" />
              <div>
                <div className="font-semibold">Failed</div>
                <div className="text-xs">{result.error}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
