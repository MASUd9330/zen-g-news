import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));
}

function extractImageFromHtml(html: string, baseUrl: string): string | null {
  // 1. og:image (highest priority — social share image)
  let m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
  if (m) return makeAbsolute(m[1], baseUrl);
  m = html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  if (m) return makeAbsolute(m[1], baseUrl);
  m = html.match(/<meta[^>]+name=["']og:image["'][^>]+content=["']([^"']+)["']/i);
  if (m) return makeAbsolute(m[1], baseUrl);

  // 2. twitter:image
  m = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
  if (m) return makeAbsolute(m[1], baseUrl);
  m = html.match(/<meta[^>]+name=["']twitter:image:src["'][^>]+content=["']([^"']+)["']/i);
  if (m) return makeAbsolute(m[1], baseUrl);

  // 3. article:image (some publishers)
  m = html.match(/<meta[^>]+name=["']article:image["'][^>]+content=["']([^"']+)["']/i);
  if (m) return makeAbsolute(m[1], baseUrl);

  // 4. JSON-LD image field
  const jsonLdMatches = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  if (jsonLdMatches) {
    for (const script of jsonLdMatches) {
      try {
        const content = script.replace(/<script[^>]*>|<\/script>/gi, '');
        const json = JSON.parse(content);
        const findImage = (obj: any): string | null => {
          if (!obj) return null;
          if (typeof obj === 'string') return obj.startsWith('http') ? obj : null;
          if (Array.isArray(obj)) { for (const i of obj) { const r = findImage(i); if (r) return r; } return null; }
          if (typeof obj === 'object') {
            if (obj['@type'] === 'ImageObject' && obj.url) return obj.url;
            if (obj.url) return obj.url;
            if (obj.image) return findImage(obj.image);
            if (obj.thumbnailUrl) return findImage(obj.thumbnailUrl);
            for (const k of Object.keys(obj)) { const r = findImage(obj[k]); if (r) return r; }
          }
          return null;
        };
        const img = findImage(json);
        if (img) return makeAbsolute(img, baseUrl);
      } catch {}
    }
  }

  // 5. First large <img> in <article> or <main>
  const articleMatch = html.match(/<article[\s\S]*?<\/article>/i) || html.match(/<main[\s\S]*?<\/main>/i);
  const target = articleMatch ? articleMatch[0] : html;
  const imgTags = target.match(/<img[^>]+src=["']([^"']+)["']/gi) || [];
  for (const tag of imgTags) {
    const src = tag.match(/src=["']([^"']+)["']/i)?.[1];
    if (!src) continue;
    // Skip tiny images, icons, logos, avatars
    if (/icon|logo|avatar|sprite|pixel|spacer|1x1|blank\.gif/i.test(src)) continue;
    const wMatch = tag.match(/width=["']?(\d+)/i);
    const hMatch = tag.match(/height=["']?(\d+)/i);
    if (wMatch && parseInt(wMatch[1]) < 200) continue;
    if (hMatch && parseInt(hMatch[1]) < 150) continue;
    return makeAbsolute(src, baseUrl);
  }

  return null;
}

function makeAbsolute(url: string, base: string): string {
  url = decodeHtmlEntities(url.trim());
  if (url.startsWith('//')) return 'https:' + url;
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) {
    try { return new URL(url, base).href; } catch { return url; }
  }
  return url;
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  const body = await request.json().catch(() => ({}));
  const limit = Math.min(body?.limit || 50, 200);

  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, slug, source_url, title')
    .or('featured_image.is.null,featured_image.eq.')
    .not('source_url', 'is', null)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const results: any[] = [];
  let successCount = 0;
  let failCount = 0;
  let skipped = 0;

  for (const article of articles || []) {
    if (!article.source_url) {
      results.push({ id: article.id, slug: article.slug, status: 'skipped', reason: 'no source_url' });
      skipped++;
      continue;
    }

    try {
      const res = await fetch(article.source_url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ZenGNews/1.0; +https://zen-g-news.netlify.app)' },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) {
        results.push({ id: article.id, slug: article.slug, status: 'failed', reason: `HTTP ${res.status}` });
        failCount++;
        continue;
      }
      const html = await res.text();
      const image = extractImageFromHtml(html, article.source_url);
      if (image) {
        const { error: upErr } = await supabase
          .from('articles')
          .update({ featured_image: image })
          .eq('id', article.id);
        if (upErr) {
          results.push({ id: article.id, slug: article.slug, status: 'failed', reason: upErr.message });
          failCount++;
        } else {
          results.push({ id: article.id, slug: article.slug, status: 'updated', image });
          successCount++;
        }
      } else {
        results.push({ id: article.id, slug: article.slug, status: 'no_image', reason: 'og/img not found' });
        failCount++;
      }
    } catch (e: any) {
      results.push({ id: article.id, slug: article.slug, status: 'failed', reason: e.message?.slice(0, 100) });
      failCount++;
    }
  }

  revalidatePath('/');
  return NextResponse.json({
    ok: true,
    startedAt: new Date(startedAt).toISOString(),
    duration_ms: Date.now() - startedAt,
    attempted: articles?.length || 0,
    updated: successCount,
    failed: failCount,
    skipped,
    results: results.slice(0, 50),
  });
}
