import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function Footer() {
  const supabase = await createClient();
  const [{ data: categories }, { data: setting }] = await Promise.all([
    supabase.from('categories').select('id, name, slug').eq('is_active', true).order('sort_order', { ascending: true }).limit(8),
    supabase.from('site_settings').select('value').eq('key', 'branding').single(),
  ]);

  const siteName = setting?.value?.site_name || 'Zen-G News';
  const tagline = setting?.value?.tagline || 'Your World. Your News. Instantly.';
  const year = new Date().getFullYear();

  return (
    <footer className="w-full mt-auto border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div className="lg:col-span-1">
            <Link href="/" className="headline-font font-black text-2xl tracking-tight text-neutral-900 dark:text-white">
              ZEN-G<span className="text-[var(--accent)]">.</span>NEWS
            </Link>
            <p className="mt-3 text-sm text-neutral-500 leading-relaxed max-w-xs">{tagline}</p>
            <p className="mt-4 text-xs text-neutral-400">Unbiased, fast, and verified breaking news from around the world.</p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-900 dark:text-white mb-4">Sections</h4>
            <ul className="space-y-2 text-sm text-neutral-500">
              <li><Link href="/" className="hover:text-[var(--accent)]">Home</Link></li>
              {(categories || []).slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <Link href={`/category/${cat.slug}`} className="hover:text-[var(--accent)]">{cat.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-900 dark:text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-neutral-500">
              <li><Link href="/about" className="hover:text-[var(--accent)]">About</Link></li>
              <li><Link href="/contact" className="hover:text-[var(--accent)]">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-[var(--accent)]">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-[var(--accent)]">Terms of Service</Link></li>
              <li><Link href="/admin/login" className="hover:text-[var(--accent)]">Newsroom Login</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-900 dark:text-white mb-4">Stay updated</h4>
            <p className="text-sm text-neutral-500 mb-3">Get the day's top stories in your inbox.</p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 min-w-0 px-3 py-2 text-sm rounded border border-[var(--border-color)] bg-[var(--bg-primary)] text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                aria-label="Email address"
              />
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium rounded text-white bg-[var(--accent)] hover:opacity-90 transition-opacity"
              >
                Join
              </button>
            </form>
            <div className="flex gap-3 mt-4 text-neutral-400">
              <a href="#" aria-label="Twitter" className="hover:text-[var(--accent)] text-xs">Twitter</a>
              <a href="#" aria-label="Facebook" className="hover:text-[var(--accent)] text-xs">Facebook</a>
              <a href="#" aria-label="LinkedIn" className="hover:text-[var(--accent)] text-xs">LinkedIn</a>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-neutral-500">
            &copy; {year} {siteName}. All rights reserved.
          </p>
          <p className="text-xs text-neutral-400">
            Built with Next.js &middot; Powered by Supabase &middot; Hosted on Netlify
          </p>
        </div>
      </div>
    </footer>
  );
}
