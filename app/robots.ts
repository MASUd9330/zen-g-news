import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin/', '/api/'] },
      { userAgent: 'Googlebot-News', allow: '/article/' },
    ],
    sitemap: 'https://zen-g-news.netlify.app/sitemap.xml',
  };
}
