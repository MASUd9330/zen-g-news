'use client';
import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';

export default function LanguageToggle() {
  const [lang, setLang] = useState<'en' | 'bn'>('en');

  useEffect(() => {
    const m = document.cookie.match(/zg_lang=(en|bn)/);
    if (m) setLang(m[1] as 'en' | 'bn');
  }, []);

  const toggle = (next: 'en' | 'bn') => {
    setLang(next);
    document.cookie = `zg_lang=${next}; path=/; max-age=31536000`;
    document.documentElement.lang = next;
    // Reload to refetch server components in new locale
    window.location.reload();
  };

  return (
    <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
      <Globe className="w-3 h-3 text-neutral-500" />
      <button
        onClick={() => toggle('en')}
        className={`px-1.5 py-0.5 rounded ${lang === 'en' ? 'bg-[var(--accent)] text-white' : 'text-neutral-500 hover:text-[var(--accent)]'}`}
        aria-label="English"
      >
        EN
      </button>
      <span className="text-neutral-300">|</span>
      <button
        onClick={() => toggle('bn')}
        className={`px-1.5 py-0.5 rounded ${lang === 'bn' ? 'bg-[var(--accent)] text-white' : 'text-neutral-500 hover:text-[var(--accent)]'}`}
        aria-label="বাংলা"
      >
        বাং
      </button>
    </div>
  );
}
