import { schedule } from '@netlify/functions';
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
        const slug = item.title.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 80) + '-' + Math.random().toString(36).substring(2, 6);

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
          reading_time_minutes: Math.max(1, Math.ceil(content.split(/\s+/).length / 200)),
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
