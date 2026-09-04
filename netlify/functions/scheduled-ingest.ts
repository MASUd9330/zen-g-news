import { schedule } from '@netlify/functions';
import Parser from 'rss-parser';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import sanitizeHtml from 'sanitize-html';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const rss = new Parser({
  timeout: 15000,
  customFields: {
    feed: ['language'],
    item: [
      ['media:content', 'mediaContent', { keepArray: true }],
      ['media:thumbnail', 'mediaThumbnail', { keepArray: true }],
      ['itunes:image', 'itunesImage'],
      ['content:encoded', 'contentEncoded'],
      ['dc:creator', 'creator'],
    ],
  },
});

// Extract first image URL from HTML content (handles lazy-loaded srcset, data-src, etc.)
function extractImage(html: string): string | null {
  if (!html) return null;
  // Try <img src="...">
  let m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (m) return normalizeUrl(m[1]);
  // Try <img data-src="...">
  m = html.match(/<img[^>]+data-src=["']([^"']+)["']/i);
  if (m) return normalizeUrl(m[1]);
  // Try <source srcset="...">
  m = html.match(/<source[^>]+srcset=["']([^"'\s,]+)/i);
  if (m) return normalizeUrl(m[1]);
  return null;
}

function normalizeUrl(url: string): string | null {
  if (!url) return null;
  url = url.trim();
  if (url.startsWith('//')) return 'https:' + url;
  try {
    return new URL(url).href;
  } catch {
    return null;
  }
}

// Comprehensive image extractor — tries every known RSS field
function getBestImage(item: any): string | null {
  // 1. <enclosure url="..." type="image/*">
  if (item.enclosure?.url && /^image\//i.test(item.enclosure.type || 'image/jpeg')) {
    return normalizeUrl(item.enclosure.url);
  }
  if (item.enclosure?.url && /\.(jpe?g|png|webp|gif|avif)(\?|$)/i.test(item.enclosure.url)) {
    return normalizeUrl(item.enclosure.url);
  }

  // 2. <media:content url="..." medium="image">
  if (item.mediaContent?.length) {
    for (const m of item.mediaContent) {
      const url = m.$?.url || m.url;
      const medium = m.$?.medium || m.medium;
      if (url && (medium === 'image' || /\.(jpe?g|png|webp|gif|avif)/i.test(url))) {
        return normalizeUrl(url);
      }
    }
  }

  // 3. <media:thumbnail url="...">
  if (item.mediaThumbnail?.length) {
    for (const m of item.mediaThumbnail) {
      const url = m.$?.url || m.url;
      if (url) return normalizeUrl(url);
    }
  }

  // 4. <itunes:image href="...">
  if (item.itunesImage?.href) return normalizeUrl(item.itunesImage.href);

  // 5. <image><url>...</url></image> (RSS 2.0 feed-level)
  if (item.image?.url) return normalizeUrl(item.image.url);

  // 6. Atom feed <link rel="enclosure">
  if (Array.isArray(item.links)) {
    for (const l of item.links) {
      if (l.rel === 'enclosure' && l.type?.startsWith('image/')) return normalizeUrl(l.href);
    }
  }

  // 7. Extract from content HTML (last resort — usually <img> in body)
  const contentHtml = item.contentEncoded || item.content || item.summary || '';
  const fromContent = extractImage(contentHtml);
  if (fromContent) return fromContent;

  return null;
}

export const handler = schedule('*/5 * * * *', async () => {
  const { data: sources } = await supabase.from('sources').select('*').eq('active', true);
  let total = 0;
  for (const src of sources ?? []) {
    try {
      const feed = await rss.parseURL(src.endpoint_url);
      for (const item of feed.items ?? []) {
        if (!item.title || !item.link) continue;
        const hash = crypto.createHash('sha256').update(item.title.trim().toLowerCase() + '|' + src.id).digest('hex');
        const { data: dup } = await supabase.from('articles').select('id').eq('dedup_hash', hash).maybeSingle();
        if (dup) continue;

        const contentHtml = item.contentEncoded || item.content || item.summary || '';
        const content = sanitizeHtml(contentHtml, {
          allowedTags: ['p','br','h2','h3','h4','strong','em','ul','ol','li','a','img','blockquote','figure','figcaption'],
          allowedAttributes: { a: ['href','title'], img: ['src','alt','width','height'] }
        });
        const slug = (item.title.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 80) || 'article') + '-' + Math.random().toString(36).substring(2, 6);

        // Comprehensive image extraction
        const realImage = getBestImage(item);
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
        total++;
      }
      await supabase.from('sources').update({ last_polled_at: new Date().toISOString(), last_error: null }).eq('id', src.id);
    } catch (e: any) {
      await supabase.from('sources').update({ last_error: e.message?.slice(0, 200) || 'unknown', last_polled_at: new Date().toISOString() }).eq('id', src.id);
    }
  }
  return { statusCode: 200, body: JSON.stringify({ ok: true, ingested: total }) };
});
