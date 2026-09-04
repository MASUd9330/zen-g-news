'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Moon, Sun, Menu, X, ChevronDown, Rss } from 'lucide-react';

export default function Header({ categories = [] }: { categories: any[] }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [now, setNow] = useState<string>('');

  useEffect(() => {
    const fn = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setNow(d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }));
    };
    tick();
    const t = setInterval(tick, 60000);
    return () => clearInterval(t);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    document.cookie = `zg_theme=${next ? 'dark' : 'light'}; path=/; max-age=31536000`;
  };

  const visibleCategories = categories.slice(0, 8);
  const extraCategories = categories.slice(8);
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <header className={`w-full z-50 bg-[var(--bg-primary)] transition-shadow ${isScrolled ? 'shadow-md' : 'border-b border-[var(--border-color)]'}`}>
      {/* Utility bar (desktop only) */}
      <div className="hidden md:block border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto px-4 h-9 flex items-center justify-between text-[11px] text-neutral-500">
          <div className="flex items-center gap-4">
            <span className="font-medium">{now}</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Live Updates
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/rss.xml" className="hover:text-[var(--accent)]" aria-label="RSS">
              <Rss className="w-3.5 h-3.5" />
            </Link>
            <a href="#" className="hover:text-[var(--accent)]" aria-label="Facebook">Facebook</a>
            <a href="#" className="hover:text-[var(--accent)]" aria-label="X">X</a>
            <a href="#" className="hover:text-[var(--accent)]" aria-label="Telegram">Telegram</a>
            <a href="#" className="hover:text-[var(--accent)]" aria-label="YouTube">YouTube</a>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-6">
        <Link href="/" className="headline-font font-black text-2xl md:text-3xl tracking-tight text-neutral-900 dark:text-white shrink-0">
          ZEN-G<span className="text-[var(--accent)]">.</span>NEWS
        </Link>

        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium flex-1 justify-center">
          <Link href="/" className="hover:text-[var(--accent)] transition-colors">Home</Link>
          {visibleCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="hover:text-[var(--accent)] transition-colors"
            >
              {cat.name}
            </Link>
          ))}
          {extraCategories.length > 0 && (
            <div className="relative" onMouseEnter={() => setMoreOpen(true)} onMouseLeave={() => setMoreOpen(false)}>
              <button className="inline-flex items-center gap-1 hover:text-[var(--accent)]">
                More <ChevronDown className="w-3 h-3" />
              </button>
              {moreOpen && (
                <div className="absolute top-full right-0 mt-1 w-44 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded shadow-lg py-2 z-50">
                  {extraCategories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/category/${cat.slug}`}
                      className="block px-4 py-1.5 text-sm hover:bg-[var(--bg-secondary)] hover:text-[var(--accent)]"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <Link href="/search" className="p-2 text-neutral-500 hover:text-[var(--accent)]" aria-label="Search">
            <Search className="w-4 h-4" />
          </Link>
          <button onClick={toggleTheme} className="p-2 text-neutral-500 hover:text-[var(--accent)]" aria-label="Toggle theme">
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Link href="/admin/login" className="hidden md:inline-block px-3 py-1.5 text-xs font-semibold bg-[var(--accent)] text-white rounded hover:opacity-90">
            Subscribe
          </Link>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-neutral-500" aria-label="Menu">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[var(--border-color)] bg-[var(--bg-primary)]">
          <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col">
            <form action="/search" method="get" className="mb-3">
              <div className="flex items-center gap-2 px-3 py-2 border border-[var(--border-color)] rounded">
                <Search className="w-4 h-4 text-neutral-400" />
                <input
                  name="q"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search news..."
                  className="flex-1 bg-transparent outline-none text-sm"
                />
              </div>
            </form>
            <Link href="/" className="py-2 text-sm font-medium border-b border-[var(--border-color)]" onClick={() => setMobileOpen(false)}>Home</Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="py-2 text-sm border-b border-[var(--border-color)]"
                onClick={() => setMobileOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
            <Link href="/admin/login" className="py-3 text-sm font-semibold text-[var(--accent)]" onClick={() => setMobileOpen(false)}>
              Newsroom Login →
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
