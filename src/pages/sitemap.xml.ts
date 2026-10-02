import type { APIRoute } from 'astro';
import { provider } from '@/lib/providers';
import topTagsRaw from '@data/pb/top-tags.json';

const SITE  = 'https://senses.dhurta.org';
const TODAY = new Date().toISOString().split('T')[0];

function url(
  path: string,
  opts: { priority?: string; freq?: string; lastmod?: string; images?: { loc: string; title: string }[] } = {},
): string {
  const { priority = '0.6', freq = 'weekly', lastmod = TODAY, images = [] } = opts;
  const imgTags = images.map(img =>
    `    <image:image>\n      <image:loc>${escXml(img.loc)}</image:loc>\n      <image:title>${escXml(img.title)}</image:title>\n    </image:image>`
  ).join('\n');
  const imgBlock = imgTags ? `\n${imgTags}` : '';
  return `  <url>\n    <loc>${SITE}${path}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${freq}</changefreq>\n    <priority>${priority}</priority>${imgBlock}\n  </url>`;
}

function escXml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"`,
    `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`,

    // ── Core pages ────────────────────────────────────────────────
    url('/',            { priority: '1.0', freq: 'daily' }),
    url('/sight',       { priority: '0.9', freq: 'daily' }),
    url('/hearing',     { priority: '0.9', freq: 'daily' }),
    url('/explore',     { priority: '0.8', freq: 'daily' }),
    url('/discover',    { priority: '0.8', freq: 'daily' }),
    url('/gallery',     { priority: '0.8', freq: 'daily' }),
    url('/collections', { priority: '0.7', freq: 'weekly' }),
    url('/trending',    { priority: '0.7', freq: 'daily' }),
    url('/editorial',   { priority: '0.7', freq: 'weekly' }),
    url('/search',      { priority: '0.7', freq: 'weekly' }),

    // ── Static info pages (no noIndex pages here) ─────────────────
    url('/about',               { priority: '0.7', freq: 'monthly' }),
    url('/faq',                 { priority: '0.7', freq: 'monthly' }),
    url('/creators',            { priority: '0.7', freq: 'weekly' }),
    url('/licensing',           { priority: '0.6', freq: 'monthly' }),
    url('/privacy',             { priority: '0.5', freq: 'monthly' }),
    url('/terms',               { priority: '0.5', freq: 'monthly' }),

    // ── Free image SEO landing pages ──────────────────────────────
    url('/royalty-free-images', { priority: '0.9', freq: 'weekly' }),
    url('/free-photos',         { priority: '0.9', freq: 'weekly' }),
    url('/free-illustrations',  { priority: '0.9', freq: 'weekly' }),
    url('/free-vectors',        { priority: '0.9', freq: 'weekly' }),
    // Note: /settings, /my-senses, /ambassadors, /contests, /live,
    //       /forum, /senses-radio, /api are all noIndex — excluded.

    // ── Sight sections ────────────────────────────────────────────
    url('/sight/photos',        { priority: '0.7' }),
    url('/sight/videos',        { priority: '0.7' }),
    url('/sight/illustrations', { priority: '0.7' }),
    url('/sight/wallpapers',    { priority: '0.7' }),

    // ── Hearing sections ──────────────────────────────────────────
    url('/hearing/music',   { priority: '0.7' }),
    url('/hearing/sounds',  { priority: '0.7' }),
    url('/hearing/ambient', { priority: '0.7' }),
    url('/hearing/lo-fi',   { priority: '0.7' }),

    // ── Media detail pages (with image extensions for sight) ──────
    ...allMedia.map(m => {
      const lastmod = m.createdAt ? new Date(m.createdAt).toISOString().split('T')[0] : TODAY;
      const thumbnail = (m as any).data?.thumbnailUrl ?? (m as any).thumbnail ?? '';
      const images = m.division === 'sight' && thumbnail
        ? [{ loc: thumbnail, title: m.title }]
        : [];
      return url(`/${m.division}/${m.type}/${m.slug}`, { priority: '0.8', freq: 'monthly', lastmod, images });
    }),

    // ── Creator pages ─────────────────────────────────────────────
    ...allCreators.map(c =>
      url(`/creator/${c.id}`, { priority: '0.7', freq: 'weekly' })
    ),

    // ── Collection pages ──────────────────────────────────────────
    ...allCollections.map(c =>
      url(`/collections/${c.slug}`, { priority: '0.6', freq: 'monthly' })
    ),

    // ── Tag pages: curated + top 2000 Pixabay tags ───────────────
    ...(() => {
      const tagSlugs = new Set<string>();
      allTags.forEach(t => tagSlugs.add(encodeURIComponent(t)));
      topTagsRaw.forEach(({ slug }) => tagSlugs.add(slug));
      return [...tagSlugs].map(s =>
        url(`/tag/${s}`, { priority: '0.7', freq: 'weekly' })
      );
    })(),

    // ── Mood pages ────────────────────────────────────────────────
    ...allMoods.map(m =>
      url(`/mood/${encodeURIComponent(m)}`, { priority: '0.6', freq: 'weekly' })
    ),

    // ── Style pages ───────────────────────────────────────────────
    ...allStyles.map(s =>
      url(`/style/${encodeURIComponent(s)}`, { priority: '0.6', freq: 'weekly' })
    ),

    `</urlset>`,
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
