// setup.js — Run: node setup.js
const fs = require('fs');
const path = require('path');

const files = {
  'package.json': JSON.stringify({
    "name": "zen-g-news",
    "version": "2.0.0",
    "private": true,
    "scripts": {
      "dev": "next dev",
      "build": "next build",
      "start": "next start"
    },
    "dependencies": {
      "@netlify/functions": "^3.0.0",
      "@netlify/plugin-nextjs": "^5.9.4",
      "@supabase/ssr": "^0.5.2",
      "@supabase/supabase-js": "^2.48.1",
      "clsx": "^2.1.1",
      "lucide-react": "^0.475.0",
      "next": "^15.1.7",
      "react": "^19.0.0",
      "react-dom": "^19.0.0",
      "rss-parser": "^3.13.0",
      "sanitize-html": "^2.14.0",
      "tailwind-merge": "^3.0.1"
    },
    "devDependencies": {
      "@types/node": "^22.13.4",
      "@types/react": "^19.0.10",
      "@types/react-dom": "^19.0.4",
      "@types/sanitize-html": "^2.13.0",
      "autoprefixer": "^10.4.20",
      "postcss": "^8.5.2",
      "tailwindcss": "^3.4.17",
      "typescript": "^5.7.3"
    }
  }, null, 2),

  'netlify.toml': `[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
`,

  'next.config.mjs': `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
};
export default nextConfig;
`,

  'tailwind.config.ts': `import type { Config } from 'tailwindcss';
const config: Config = {
  darkMode: 'class',
  content: ['./components/**/*.{js,ts,jsx,tsx}', './app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: { 'xs': '360px' },
      colors: {
        background: 'var(--bg-primary)',
        foreground: 'var(--text-primary)',
        accent: 'var(--accent)',
      },
    },
  },
  plugins: [],
};
export default config;
`,

  'postcss.config.mjs': `export default {
  plugins: { tailwindcss: {}, autoprefixer: {} },
};
`,

  'tsconfig.json': JSON.stringify({
    "compilerOptions": {
      "target": "ES2022",
      "lib": ["dom", "dom.iterable", "esnext"],
      "allowJs": true,
      "skipLibCheck": true,
      "strict": true,
      "noEmit": true,
      "esModuleInterop": true,
      "module": "esnext",
      "moduleResolution": "bundler",
      "resolveJsonModule": true,
      "isolatedModules": true,
      "jsx": "preserve",
      "incremental": true,
      "plugins": [{ "name": "next" }],
      "paths": { "@/*": ["./*"] }
    },
    "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
    "exclude": ["node_modules"]
  }, null, 2),

  '.env.example': `# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
NEXT_PUBLIC_SITE_URL=https://your-site.netlify.app

# Optional Social
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
`,

  '.gitignore': `node_modules
.next
.env*.local
.env
dist
`,

  'app/globals.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg-primary: #FFFFFF;
  --bg-secondary: #F8FAFC;
  --text-primary: #0F172A;
  --text-muted: #64748B;
  --border-color: #E2E8F0;
  --accent: #2563EB;
}

.dark {
  --bg-primary: #0B0E14;
  --bg-secondary: #12151C;
  --text-primary: #F8FAFC;
  --text-muted: #94A3B8;
  --border-color: #1E293B;
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  overflow-x: hidden;
  transition: background-color 200ms ease, color 200ms ease;
}

.headline-font {
  font-family: var(--font-serif), Georgia, serif;
}

.marquee-container:hover .marquee-content,
.marquee-container:focus-within .marquee-content {
  animation-play-state: paused;
}

@keyframes marquee {
  0% { transform: translateX(0%); }
  100% { transform: translateX(-50%); }
}

.animate-marquee {
  display: inline-flex;
  white-space: nowrap;
  animation: marquee 35s linear infinite;
}
`,

  'app/layout.tsx': `import type { Metadata } from 'next';
import { Inter, Source_Serif_4 } from 'next/font/google';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const serif = Source_Serif_4({ subsets: ['latin'], variable: '--font-serif', display: 'swap' });

export const metadata: Metadata = {
  title: 'Zen-G News — Your World. Your News. Instantly.',
  description: 'Unbiased, fast, and verified breaking news.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const theme = cookieStore.get('zg_theme')?.value || 'system';

  const supabase = await createClient();
  const { data: setting } = await supabase.from('site_settings').select('value').eq('key', 'branding').single();
  const accentColor = setting?.value?.accent_color || '#2563EB';

  return (
    <html lang="en" className={theme === 'dark' ? 'dark' : ''}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: \`:root { --accent: \${accentColor}; }\` }} />
      </head>
      <body className={\`\${inter.variable} \${serif.variable} antialiased min-h-screen flex flex-col\`}>
        {children}
      </body>
    </html>
  );
}
`,

  'lib/supabase/client.ts': `import { createBrowserClient } from '@supabase/ssr';
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
`,

  'lib/supabase/server.ts': `import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {}
        },
      },
    }
  );
}
`,

  'middleware.ts': `import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || !['admin', 'editor'].includes(profile.role)) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  if (pathname === '/admin/login' && user) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/admin/:path*', '/((?!_next/static|_next/image|favicon.ico).*)'],
};
`,

  'app/auth/signout/route.ts': `import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/admin/login', request.url), { status: 302 });
}
`,

  'netlify/functions/scheduled-ingest.ts': `import { schedule } from '@netlify/functions';
import Parser from 'rss-parser';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import sanitizeHtml from 'sanitize-html';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const rss = new Parser();

export const handler = schedule('*/5 * * * *', async () => {
  const { data: sources } = await supabase.from('sources').select('*').eq('active', true);
  for (const src of sources ?? []) {
    try {
      const feed = await rss.parseURL(src.endpoint_url);
      for (const item of feed.items ?? []) {
        if (!item.title || !item.link) continue;
        const hash = crypto.createHash('sha256').update(item.title.trim().toLowerCase() + '|' + src.id).digest('hex');
        const { data: dup } = await supabase.from('articles').select('id').eq('dedup_hash', hash).maybeSingle();
        if (dup) continue;

        const content = sanitizeHtml(item['content:encoded'] || item.content || item.summary || '');
        const slug = item.title.toLowerCase().replace(/[^\\w\\s-]/g, '').trim().replace(/\\s+/g, '-').slice(0, 80) + '-' + Math.random().toString(36).substring(2, 6);

        await supabase.from('articles').insert({
          title: item.title.trim(),
          slug,
          excerpt: sanitizeHtml(content, { allowedTags: [] }).slice(0, 260),
          content,
          featured_image: item.enclosure?.url || null,
          category_id: src.default_category_id,
          source_id: src.id,
          source_url: item.link,
          author_name: src.name,
          reading_time_minutes: Math.max(1, Math.ceil(content.split(/\\s+/).length / 200)),
          status: src.auto_publish_trusted ? 'published' : 'draft',
          dedup_hash: hash,
          published_at: src.auto_publish_trusted ? new Date().toISOString() : null
        });
      }
      await supabase.from('sources').update({ last_polled_at: new Date().toISOString(), last_error: null }).eq('id', src.id);
    } catch (e: any) {
      await supabase.from('sources').update({ last_error: e.message, last_polled_at: new Date().toISOString() }).eq('id', src.id);
    }
  }
  return { statusCode: 200 };
});
`,

  'netlify/functions/scheduled-publish.ts': `import { schedule } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export const handler = schedule('* * * * *', async () => {
  const now = new Date().toISOString();
  await supabase.from('articles')
    .update({ status: 'published', published_at: now })
    .eq('status', 'scheduled')
    .lte('scheduled_for', now);
  return { statusCode: 200 };
});
`,

  'components/AdSlot.tsx': `'use client';
import { useEffect, useRef, useState } from 'react';

export default function AdSlot({ placement }: { placement?: any }) {
  const ref = useRef<HTMLDivElement>(null);
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    setConsent(!document.cookie.includes('zg_ad_consent=false'));
  }, []);

  useEffect(() => {
    if (!consent || !placement?.is_active || !placement?.js_code || !ref.current) return;
    const script = document.createElement('script');
    script.text = placement.js_code;
    script.async = true;
    ref.current.appendChild(script);
    return () => { script.remove(); };
  }, [consent, placement]);

  if (!placement || !placement.is_active) return null;

  return (
    <aside className="w-full flex justify-center items-center my-6 overflow-hidden">
      <div ref={ref} className="w-full flex flex-col items-center justify-center p-2 rounded border border-dashed border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 min-h-[100px] relative">
        <span className="absolute top-1 right-2 text-[9px] text-neutral-400">Advertisement</span>
        {placement.css_code && <style dangerouslySetInnerHTML={{ __html: placement.css_code }} />}
        {consent && placement.html_code ? (
          <div dangerouslySetInnerHTML={{ __html: placement.html_code }} />
        ) : (
          <span className="text-neutral-400 text-xs select-none">Sponsored Space</span>
        )}
      </div>
    </aside>
  );
}
`,

  'components/ArticleCard.tsx': `import Link from 'next/link';
import Image from 'next/image';
import { Clock } from 'lucide-react';

export default function ArticleCard({ title, slug, excerpt, featured_image, category, author_name, reading_time_minutes = 2, compact = false }: any) {
  return (
    <article className="group flex flex-col justify-between h-full">
      <div>
        <Link href={\`/article/\${slug}\`} className="block relative aspect-[16/10] overflow-hidden rounded bg-neutral-800 mb-3">
          {featured_image ? (
            <Image src={featured_image} alt={title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-200 group-hover:scale-[1.03]" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-500 text-xs">Zen-G News</div>
          )}
          {category && (
            <span className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[10px] uppercase font-bold rounded bg-neutral-900/80 text-white">
              {category.name}
            </span>
          )}
        </Link>
        <h3 className={\`headline-font font-bold leading-snug group-hover:text-[var(--accent)] transition-colors \${compact ? 'text-sm mb-1.5' : 'text-lg mb-2'}\`}>
          <Link href={\`/article/\${slug}\`} className="line-clamp-2">{title}</Link>
        </h3>
        {!compact && excerpt && <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed mb-3">{excerpt}</p>}
      </div>
      <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-2 border-t border-[var(--border-color)]">
        <span className="truncate max-w-[120px] font-medium">{author_name || 'Editorial'}</span>
        <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{reading_time_minutes}m</span>
      </div>
    </article>
  );
}
`,

  'components/Header.tsx': `'use client';
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
    document.cookie = \`zg_theme=\${next ? 'dark' : 'light'}; path=/; max-age=31536000\`;
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
            <Link key={cat.id} href={\`/category/\${cat.slug}\`} className="hover:text-[var(--accent)]">{cat.name}</Link>
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
`,

  'app/(public)/page.tsx': `import { createClient } from '@/lib/supabase/server';
import Header from '@/components/Header';
import ArticleCard from '@/components/ArticleCard';
import AdSlot from '@/components/AdSlot';
import Link from 'next/link';

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();
  const [
    { data: categories },
    { data: articles },
    { data: ads }
  ] = await Promise.all([
    supabase.from('categories').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
    supabase.from('articles').select('*, categories(name, slug)').eq('status', 'published').order('published_at', { ascending: false }).limit(12),
    supabase.from('ad_placements').select('*').eq('is_active', true)
  ]);

  const topAd = ads?.find(a => a.placement_key === 'homepage_top');
  const hero = articles?.[0];
  const rest = articles?.slice(1) || [];

  return (
    <>
      <Header categories={categories || []} />
      <main className="max-w-7xl mx-auto px-4 py-6 w-full flex-1">
        <AdSlot placement={topAd} />
        {hero && (
          <section className="mb-10 pb-8 border-b border-[var(--border-color)]">
            <h1 className="headline-font font-black text-3xl sm:text-5xl mb-4 hover:text-[var(--accent)]">
              <Link href={\`/article/\${hero.slug}\`}>{hero.title}</Link>
            </h1>
            <p className="text-neutral-500 text-sm sm:text-base max-w-3xl mb-4">{hero.excerpt}</p>
          </section>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {rest.map((art) => (
            <ArticleCard key={art.slug} {...art} category={art.categories} />
          ))}
        </div>
      </main>
    </>
  );
}
`,

  'app/(public)/article/[slug]/page.tsx': `import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Header from '@/components/Header';
import Image from 'next/image';

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const [{ data: article }, { data: categories }] = await Promise.all([
    supabase.from('articles').select('*, categories(name, slug)').eq('slug', slug).eq('status', 'published').single(),
    supabase.from('categories').select('*').eq('is_active', true)
  ]);

  if (!article) notFound();

  return (
    <>
      <Header categories={categories || []} />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="headline-font font-black text-3xl sm:text-5xl mb-4">{article.title}</h1>
        <p className="text-sm text-neutral-500 mb-6">By {article.author_name} • {new Date(article.published_at).toLocaleDateString()}</p>
        {article.featured_image && (
          <div className="relative aspect-[16/9] w-full rounded overflow-hidden mb-6 bg-neutral-800">
            <Image src={article.featured_image} alt={article.title} fill className="object-cover" />
          </div>
        )}
        <div className="prose dark:prose-invert max-w-none text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: article.content }} />
      </main>
    </>
  );
}
`,

  'app/(admin)/login/page.tsx': `'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }
    router.push('/admin/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0E14] px-4">
      <form onSubmit={handleLogin} className="max-w-sm w-full bg-[#12151C] p-6 border border-neutral-800 rounded space-y-4">
        <h1 className="headline-font text-xl font-bold text-white text-center">Zen-G Editorial Login</h1>
        <input type="email" required placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-sm text-white" />
        <input type="password" required placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-sm text-white" />
        <button type="submit" disabled={loading} className="w-full py-2 bg-blue-600 text-white font-bold rounded text-xs uppercase">{loading ? 'Verifying...' : 'Sign In'}</button>
      </form>
    </div>
  );
}
`,

  'app/(admin)/dashboard/page.tsx': `import { createClient } from '@/lib/supabase/server';
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
`,

  'app/(admin)/layout.tsx': `import Link from 'next/link';
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-[#0B0E14]">
      <aside className="w-56 bg-[#12151C] border-r border-neutral-800 p-4 flex flex-col justify-between text-xs">
        <div className="space-y-4">
          <div className="font-black text-lg text-white">ZEN-G CMS</div>
          <nav className="space-y-2 text-neutral-400">
            <Link href="/admin/dashboard" className="block hover:text-white">Dashboard</Link>
            <Link href="/" target="_blank" className="block hover:text-white">View Live Site ↗</Link>
          </nav>
        </div>
        <form action="/auth/signout" method="post">
          <button type="submit" className="text-rose-400 font-semibold">Sign Out</button>
        </form>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
`
};

console.log('⚡ Generating full Zen-G News v2 project structure...');
Object.entries(files).forEach(([relPath, content]) => {
  const fullPath = path.join(__dirname, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('✔ Created: ' + relPath);
});

console.log('\\n🚀 Project successfully built! Follow these 2 commands:');
console.log('1. npm install');
console.log('2. git init && git add . && git commit -m "initial commit"');