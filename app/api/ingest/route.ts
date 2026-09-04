import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import sanitizeHtml from 'sanitize-html';
import { revalidatePath } from 'next/cache';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const rss = new Parser({
  timeout: 20000,
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: true }],
      ['media:thumbnail', 'mediaThumbnail', { keepArray: true }],
      ['itunes:image', 'itunesImage'],
      ['content:encoded', 'contentEncoded'],
      ['dc:creator', 'creator'],
    ],
  },
});

function normalizeUrl(url: string): string | null {
  if (!url) return null;
  url = url.trim();
  if (url.startsWith('//')) return 'https:' + url;
  try { return new URL(url).href; } catch { return null; }
}

function extractImage(html: string): string | null {
  if (!html) return null;
  let m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (m) return normalizeUrl(m[1]);
  m = html.match(/<img[^>]+data-src=["']([^"']+)["']/i);
  if (m) return normalizeUrl(m[1]);
  m = html.match(/<source[^>]+srcset=["']([^"'\s,]+)/i);
  if (m) return normalizeUrl(m[1]);
  return null;
}

function getBestImage(item: any): string | null {
  if (item.enclosure?.url && /^image\//i.test(item.enclosure.type || 'image/jpeg')) return normalizeUrl(item.enclosure.url);
  if (item.enclosure?.url && /\.(jpe?g|png|webp|gif|avif)/i.test(item.enclosure.url)) return normalizeUrl(item.enclosure.url);
  if (item.mediaContent?.length) {
    for (const m of item.mediaContent) {
      const url = m.$?.url || m.url;
      const medium = m.$?.medium || m.medium;
      if (url && (medium === 'image' || /\.(jpe?g|png|webp|gif|avif)/i.test(url))) return normalizeUrl(url);
    }
  }
  if (item.mediaThumbnail?.length) {
    for (const m of item.mediaThumbnail) {
      const url = m.$?.url || m.url;
      if (url) return normalizeUrl(url);
    }
  }
  if (item.itunesImage?.href) return normalizeUrl(item.itunesImage.href);
  if (item.image?.url) return normalizeUrl(item.image.url);
  if (Array.isArray(item.links)) {
    for (const l of item.links) {
      if (l.rel === 'enclosure' && l.type?.startsWith('image/')) return normalizeUrl(l.href);
    }
  }
  const contentHtml = item.contentEncoded || item.content || item.summary || '';
  return extractImage(contentHtml);
}

export async function POST(request: Request) {
  const startedAt = new Date().toISOString();
  const result: { sources: any[]; total: number; errors: string[]; images_extracted: number; duration_ms: number } = {
    sources: [],
    total: 0,
    errors: [],
    images_extracted: 0,
    duration_ms: 0,
  };

  try {
    const { data: sources } = await supabase.from('sources').select('*').eq('active', true);
    if (!sources || sources.length === 0) {
      return NextResponse.json({ ok: false, error: 'No active sources' }, { status: 400 });
    }

    for (const src of sources) {
      const sourceStart = Date.now();
      const sourceResult = { name: src.name, fetched: 0, added: 0, images_found: 0, error: null as string | null };
      try {
        const feed = await rss.parseURL(src.endpoint_url);
        for (const item of feed.items ?? []) {
          if (!item.title || !item.link) continue;
          sourceResult.fetched++;
          const hash = crypto.createHash('sha256').update(item.title.trim().toLowerCase() + '|' + src.id).digest('hex');
          const { data: dup } = await supabase.from('articles').select('id').eq('dedup_hash', hash).maybeSingle();
          if (dup) continue;

          const contentHtml = item.contentEncoded || item.content || item.summary || '';
          const content = sanitizeHtml(contentHtml, {
            allowedTags: ['p','br','h2','h3','h4','strong','em','ul','ol','li','a','img','blockquote','figure','figcaption'],
            allowedAttributes: { a: ['href','title'], img: ['src','alt','width','height'] }
          });
          const slug = (item.title.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 80) || 'article') + '-' + Math.random().toString(36).substring(2, 6);

          const realImage = getBestImage(item);
          if (realImage) sourceResult.images_found++;
          const featured_image = realImage || `https://picsum.photos/seed/${encodeURIComponent(slug)}/1200/750`;

          await supabase.from('articles').insert({
            title: item.title.trim().slice(0, 280),
            slug,
            excerpt: sanitizeHtml(contentHtml, { allowedTags: [] }).slice(0, 260).trim(),
            content,
            featured_image,
            category_id: src.default_category_id,
            source_id: src.id,
            source_url: item.link,
            author_name: (item as any).creator || (item as any).author || src.name,
            reading_time_minutes: Math.max(1, Math.ceil((contentHtml.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length) / 200)),
            status: src.auto_publish_trusted ? 'published' : 'draft',
            dedup_hash: hash,
            published_at: src.auto_publish_trusted ? new Date().toISOString() : null,
          });
          sourceResult.added++;
        }
        await supabase.from('sources').update({ last_polled_at: new Date().toISOString(), last_error: null }).eq('id', src.id);
      } catch (e: any) {
        sourceResult.error = e.message?.slice(0, 200) || 'unknown';
        result.errors.push(`${src.name}: ${sourceResult.error}`);
        await supabase.from('sources').update({ last_error: sourceResult.error, last_polled_at: new Date().toISOString() }).eq('id', src.id);
      }
      (sourceResult as any).duration_ms = Date.now() - sourceStart;
      result.sources.push(sourceResult);
      result.total += sourceResult.added;
      result.images_extracted += sourceResult.images_found;
    }

    result.duration_ms = Date.now() - new Date(startedAt).getTime();
    revalidatePath('/');
    return NextResponse.json({ ok: true, ...result, startedAt });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message, ...result }, { status: 500 });
  }
}
