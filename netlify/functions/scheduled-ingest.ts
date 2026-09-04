import { schedule } from '@netlify/functions';
import Parser from 'rss-parser';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import sanitizeHtml from 'sanitize-html';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const rss = new Parser({ timeout: 15000 });

// Extract first image URL from HTML content
function extractImage(html: string): string | null {
  if (!html) return null;
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (!m) return null;
  let url = m[1];
  // Strip query params that often break (esp. BBC, Reuters)
  try {
    const u = new URL(url);
    if (u.hostname.includes('bbci.co.uk') || u.hostname.includes('reuters')) {
      // Keep url as-is for these (they work with query params)
    }
    return u.href;
  } catch {
    return null;
  }
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

        const contentHtml = item['content:encoded'] || item.content || item.summary || '';
        const content = sanitizeHtml(contentHtml, { allowedTags: ['p','br','h2','h3','h4','strong','em','ul','ol','li','a','img','blockquote','figure','figcaption'], allowedAttributes: { a: ['href','title'], img: ['src','alt','width','height'] } });
        const slug = (item.title.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 80) || 'article') + '-' + Math.random().toString(36).substring(2, 6);

        // Try enclosure first, then content, then Picsum fallback
        const realImage = item.enclosure?.url || extractImage(contentHtml) || null;
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
          author_name: item.creator || item.author || src.name,
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
