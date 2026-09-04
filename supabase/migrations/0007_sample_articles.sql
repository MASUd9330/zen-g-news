-- Zen-G News — Sample articles so all category pages have content
-- Run AFTER previous migrations

-- Sample articles for empty categories
insert into public.articles (title, slug, excerpt, content, category_id, status, published_at, reading_time_minutes, author_name, view_count, is_trending)
select * from (values
  (
    'New medical research reveals breakthrough in preventative cardiac care for adults over 50',
    'medical-research-cardiac-care-breakthrough-' || extract(epoch from now())::int,
    'A landmark peer-reviewed study published this week outlines a novel preventative approach that has shown significant reduction in cardiovascular events among adults over 50.',
    '<p>A landmark peer-reviewed study published this week outlines a novel preventative approach that has shown significant reduction in cardiovascular events among adults over 50. The multi-center trial followed more than 12,000 participants across 18 countries over a six-year period.</p><p>Researchers say the findings could reshape primary care protocols globally and reduce the long-term burden on healthcare systems.</p>',
    (select id from public.categories where slug = 'health'),
    'published',
    now() - interval '2 hours',
    4,
    'Dr. Eleanor Vance',
    1240,
    true
  ),
  (
    'Quantum computing milestone: New architecture achieves sustained coherence at room temperature',
    'quantum-computing-room-temperature-' || extract(epoch from now())::int,
    'A research consortium has announced the first stable room-temperature quantum processor, potentially unlocking commercial applications within the decade.',
    '<p>A research consortium has announced the first stable room-temperature quantum processor, potentially unlocking commercial applications within the decade. The breakthrough addresses one of the most significant barriers to mass deployment of quantum systems.</p><p>Industry analysts predict this could accelerate timelines for cryptography, drug discovery, and complex optimization problems by years.</p>',
    (select id from public.categories where slug = 'science'),
    'published',
    now() - interval '3 hours',
    5,
    'Marcus Chen',
    890,
    true
  ),
  (
    'Modern architectural movement: Sustainable high-rise living takes root in Southeast Asia',
    'sustainable-high-rise-living-sea-' || extract(epoch from now())::int,
    'A new wave of architects and urban planners is reimagining the residential tower as a model of environmental harmony.',
    '<p>A new wave of architects and urban planners is reimagining the residential tower as a model of environmental harmony. Recent projects in Singapore, Bangkok, and Jakarta demonstrate how vertical living can integrate biophilic design, passive cooling, and on-site renewable energy generation.</p><p>The movement signals a broader shift in how cities might address the dual challenges of rapid urbanization and climate resilience.</p>',
    (select id from public.categories where slug = 'lifestyle'),
    'published',
    now() - interval '5 hours',
    4,
    'Priya Anand',
    642,
    false
  ),
  (
    'Top diplomats convene in Geneva for emergency summit on regional security framework',
    'geneva-emergency-summit-regional-security-' || extract(epoch from now())::int,
    'Senior envoys from over thirty nations are meeting to negotiate an updated framework for regional security cooperation amid rising tensions.',
    '<p>Senior envoys from over thirty nations are meeting to negotiate an updated framework for regional security cooperation amid rising tensions in multiple hotspots. The closed-door discussions are expected to continue through the weekend.</p><p>Observers say the outcome could have significant implications for diplomatic posture, trade routes, and humanitarian corridors across several regions.</p>',
    (select id from public.categories where slug = 'world'),
    'published',
    now() - interval '7 hours',
    5,
    'Alexander Sterling',
    2103,
    true
  ),
  (
    'New fiscal policy package aims to support small businesses across rural districts',
    'fiscal-policy-rural-small-business-support-' || extract(epoch from now())::int,
    'Government officials unveiled a comprehensive package of tax incentives and grants designed to stimulate small-business growth in underserved districts.',
    '<p>Government officials unveiled a comprehensive package of tax incentives and grants designed to stimulate small-business growth in underserved districts. The program targets manufacturing, agritech, and digital services sectors.</p><p>Economists say the measure could create tens of thousands of jobs if implemented efficiently, but caution that bureaucratic execution remains a risk.</p>',
    (select id from public.categories where slug = 'business'),
    'published',
    now() - interval '9 hours',
    3,
    'Nadia Hassan',
    1872,
    false
  ),
  (
    'Open-source AI toolkit breaks new ground in low-resource language processing',
    'open-source-ai-low-resource-languages-' || extract(epoch from now())::int,
    'A consortium of academic researchers has released a new open-source toolkit specifically designed for natural language processing in low-resource languages.',
    '<p>A consortium of academic researchers has released a new open-source toolkit specifically designed for natural language processing in low-resource languages, including Bengali, Swahili, and Quechua. The toolkit promises to bridge long-standing gaps in digital accessibility for hundreds of millions of speakers.</p><p>Major cloud providers have already announced plans to integrate the toolkit into their public offerings.</p>',
    (select id from public.categories where slug = 'technology'),
    'published',
    now() - interval '11 hours',
    6,
    'Priya Anand',
    1102,
    false
  )
) as new_articles(title, slug, excerpt, content, category_id, status, published_at, reading_time_minutes, author_name, view_count, is_trending)
where not exists (select 1 from public.articles where articles.slug = new_articles.slug);
