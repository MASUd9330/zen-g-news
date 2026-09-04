'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Moon, Sun } from 'lucide-react';

export default function Header({ categories = [] }: { categories: any[] }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const fn = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    document.cookie = `zg_theme=${next ? 'dark' : 'light'}; path=/; max-age=31536000`;
  };

  return (
    <header className="w-full z-40 bg-[var(--bg-primary)] border-b border-[var(--border-color)] sticky top-0">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-6">
        <Link href="/" className="headline-font font-black text-2xl md:text-3xl tracking-tight text-neutral-900 dark:text-white">
          ZEN-G<span className="text-[var(--accent)]">.</span>NEWS
        </Link>
        <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium">
          <Link href="/" className="hover:text-[var(--accent)]">Home</Link>
          {categories.slice(0, 8).map((cat) => (
            <Link key={cat.id} href={`/category/${cat.slug}`} className="hover:text-[var(--accent)]">{cat.name}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="p-1 text-neutral-500 hover:text-white">
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Link href="/search" className="p-2 text-neutral-500 hover:text-white"><Search className="w-4 h-4" /></Link>
        </div>
      </div>
    </header>
  );
}
