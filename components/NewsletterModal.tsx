'use client';
import { useState, useEffect } from 'react';
import { X, Mail, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function NewsletterModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem('zg_newsletter_dismissed')) {
      setDismissed(true);
      return;
    }
    const t = setTimeout(() => setIsOpen(true), 25000);
    return () => clearTimeout(t);
  }, []);

  const close = () => {
    setIsOpen(false);
    setDismissed(true);
    try { sessionStorage.setItem('zg_newsletter_dismissed', '1'); } catch {}
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please provide a valid email');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Subscription failed');
      }
      setSuccess(true);
      setTimeout(close, 3500);
    } catch (e: any) {
      setError(e.message || 'Subscription failed');
    } finally {
      setLoading(false);
    }
  };

  if (dismissed || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={close}>
      <div
        className="w-full max-w-md bg-[var(--bg-primary)] border border-[var(--border-color)] shadow-2xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={close} className="absolute top-4 right-4 p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]" aria-label="Close">
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="headline-font text-2xl font-black text-[var(--text-primary)]">Welcome aboard</h3>
            <p className="text-xs text-[var(--text-muted)] max-w-xs mx-auto">
              Your subscription is active. You will receive the morning intelligence briefing beginning tomorrow.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="flex items-center gap-2 text-rose-600">
              <Mail className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Morning Intelligence</span>
            </div>

            <div>
              <h3 className="headline-font text-2xl font-black text-[var(--text-primary)] leading-tight">
                Global clarity in your inbox daily.
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                Curated geopolitical briefings, macro market movements, and tech milestones in 4 minutes.
              </p>
            </div>

            {error && (
              <div className="p-2.5 bg-red-50 dark:bg-red-950/40 text-red-600 text-xs font-medium border border-red-200">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] mb-1">Your full name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full px-3 py-2 text-xs border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] mb-1">
                  Email address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2 text-xs border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
            >
              {loading ? 'Confirming…' : 'Subscribe to Morning Brief'}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero spam guarantee · Unsubscribe anytime</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
