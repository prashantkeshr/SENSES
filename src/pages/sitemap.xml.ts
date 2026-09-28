import type { APIRoute } from 'astro';
import { provider } from '@/lib/providers';

const SITE = 'https://senses.dhurta.org';

function url(path: string, priority = '0.6', freq = 'weekly'): string {
  return `  <url>
    <loc>${SITE}${path}</loc>
    <changefreq>${freq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

export const GET: APIRoute = async () => {
  const [allMedia, allCreators, allCollections] = await Promise.all([
    provider.getMedia({}),
    provider.getCreators(500),
    provider.getCollections(),
  ]);

  const allTags   = [...new Set(allMedia.flatMap(m => m.tags))];
  const allMoods  = [...new Set(allMedia.flatMap(m => m.moods))];
  const allStyles = [...new Set(allMedia.flatMap(m => m.styles))];

  const lines = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,

    // Core pages
    url('/',            '1.0', 'daily'),
    url('/sight',       '0.9', 'daily'),
    url('/hearing',     '0.9', 'daily'),
    url('/explore',     '0.8', 'daily'),
    url('/discover',    '0.8', 'daily'),
    url('/search',      '0.7', 'weekly'),
    url('/collections', '0.7', 'weekly'),
    url('/trending',    '0.7', 'daily'),
    url('/editorial',   '0.7', 'weekly'),
    url('/my-senses',   '0.5', 'never'),
    url('/gallery',     '0.8', 'daily'),
    url('/settings',    '0.4', 'never'),

    // Sight sections
    url('/sight/photos',        '0.7'),
    url('/sight/videos',        '0.7'),
    url('/sight/illustrations', '0.7'),
    url('/sight/wallpapers',    '0.7'),

    // Hearing sections
    url('/hearing/music',   '0.7'),
    url('/hearing/sounds',  '0.7'),
    url('/hearing/ambient', '0.7'),
    url('/hearing/lo-fi',   '0.7'),

    // Media detail pages
    ...allMedia.map(m =>
      url(`/${m.division}/${m.type}/${m.slug}`, '0.8', 'monthly')
    ),

    // Creator pages
    ...allCreators.map(c =>
      url(`/creator/${c.id}`, '0.7', 'weekly')
    ),

    // Collection pages
    ...allCollections.map(c =>
      url(`/collections/${c.slug}`, '0.6', 'monthly')
    ),

    // Tag pages (top 100 only to avoid bloat)
    ...allTags.slice(0, 100).map(t =>
      url(`/tag/${encodeURIComponent(t)}`, '0.5', 'weekly')
    ),

    // Mood pages
    ...allMoods.map(m =>
      url(`/mood/${encodeURIComponent(m)}`, '0.6', 'weekly')
    ),

    // Style pages
    ...allStyles.map(s =>
      url(`/style/${encodeURIComponent(s)}`, '0.6', 'weekly')
    ),

    `</urlset>`,
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
