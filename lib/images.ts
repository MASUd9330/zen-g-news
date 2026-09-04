// Category-based stable image URLs (curated Unsplash photos)
// Each category has 5 distinct images — hashed to article id for variety
const CATEGORY_IMAGES: Record<string, string[]> = {
  world: [
    'https://images.unsplash.com/photo-1526470498-9ae73c665de8?w=1200&auto=format&fit=crop&q=80', // globe
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80', // earth
    'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=1200&auto=format&fit=crop&q=80', // globe
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&auto=format&fit=crop&q=80', // world
    'https://images.unsplash.com/photo-1488272690726-627c5b86b1c0?w=1200&auto=format&fit=crop&q=80', // capital
  ],
  politics: [
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1200&auto=format&fit=crop&q=80', // capitol
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200&auto=format&fit=crop&q=80', // vote
    'https://images.unsplash.com/photo-1606166187734-a4cb74079037?w=1200&auto=format&fit=crop&q=80', // flag
    'https://images.unsplash.com/photo-1605007493699-af65834f8a00?w=1200&auto=format&fit=crop&q=80', // gavel
    'https://images.unsplash.com/photo-1575320181282-9afab399332c?w=1200&auto=format&fit=crop&q=80', // parliament
  ],
  business: [
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200&auto=format&fit=crop&q=80', // stock market
    'https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?w=1200&auto=format&fit=crop&q=80', // chart
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&auto=format&fit=crop&q=80', // trading
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80', // finance
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80', // office
  ],
  technology: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80', // circuit
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&auto=format&fit=crop&q=80', // ai
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=80', // code
    'https://images.unsplash.com/photo-1550745165-690bcb5b4ad2?w=1200&auto=format&fit=crop&q=80', // tech
    'https://images.unsplash.com/photo-1581090700227-1e37b190418e?w=1200&auto=format&fit=crop&q=80', // data
  ],
  science: [
    'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1200&auto=format&fit=crop&q=80', // lab
    'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=1200&auto=format&fit=crop&q=80', // space
    'https://images.unsplash.com/photo-1564325724739-bae0bd08762c?w=1200&auto=format&fit=crop&q=80', // microscope
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80', // earth
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200&auto=format&fit=crop&q=80', // dna
  ],
  sports: [
    'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1200&auto=format&fit=crop&q=80', // football
    'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200&auto=format&fit=crop&q=80', // cricket
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&auto=format&fit=crop&q=80', // stadium
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1200&auto=format&fit=crop&q=80', // running
    'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1200&auto=format&fit=crop&q=80', // tennis
  ],
  entertainment: [
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80', // cinema
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80', // concert
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&auto=format&fit=crop&q=80', // music
    'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=1200&auto=format&fit=crop&q=80', // camera
    'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=1200&auto=format&fit=crop&q=80', // movie
  ],
  lifestyle: [
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&auto=format&fit=crop&q=80', // fashion
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&auto=format&fit=crop&q=80', // food
    'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=1200&auto=format&fit=crop&q=80', // lifestyle
    'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=1200&auto=format&fit=crop&q=80', // travel
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&auto=format&fit=crop&q=80', // travel2
  ],
  health: [
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1200&auto=format&fit=crop&q=80', // stethoscope
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&auto=format&fit=crop&q=80', // hospital
    'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=1200&auto=format&fit=crop&q=80', // pharmacy
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&auto=format&fit=crop&q=80', // medical
    'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=1200&auto=format&fit=crop&q=80', // wellness
  ],
  bangladesh: [
    'https://images.unsplash.com/photo-1602523498328-c43ce91cea1f?w=1200&auto=format&fit=crop&q=80', // dhaka
    'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=1200&auto=format&fit=crop&q=80', // bd flag
    'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?w=1200&auto=format&fit=crop&q=80', // river
    'https://images.unsplash.com/photo-1583289196613-5ea3a45a8b30?w=1200&auto=format&fit=crop&q=80', // street
    'https://images.unsplash.com/photo-1597212720200-23eb8d8f8e44?w=1200&auto=format&fit=crop&q=80', // rural
  ],
  'top-stories': [
    'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1200&auto=format&fit=crop&q=80', // newspaper
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&auto=format&fit=crop&q=80', // news
    'https://images.unsplash.com/photo-1554420473-b5da0e8c46a0?w=1200&auto=format&fit=crop&q=80', // breaking
    'https://images.unsplash.com/photo-1551184451-76b762941ad6?w=1200&auto=format&fit=crop&q=80', // news2
    'https://images.unsplash.com/photo-1557992260-ec58e92789fc?w=1200&auto=format&fit=crop&q=80', // press
  ],
};

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517999144091-3d9dca6d1e43?w=1200&auto=format&fit=crop&q=80',
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return Math.abs(h);
}

export function imageForArticle(article: { slug: string; category_id?: string; categories?: { slug?: string } | null; featured_image?: string | null }): string {
  if (article.featured_image && article.featured_image.startsWith('http')) return article.featured_image;
  const catSlug = (article.categories?.slug || 'top-stories').toLowerCase();
  const images = CATEGORY_IMAGES[catSlug] || FALLBACK_IMAGES;
  const idx = hashString(article.slug) % images.length;
  return images[idx];
}
