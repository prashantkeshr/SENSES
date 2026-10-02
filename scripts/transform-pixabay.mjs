/**
 * transform-pixabay.mjs
 * Converts general.jsonl (86k Pixabay records) into chunked static JSON files
 * and build-time import data for Astro SSG pages.
 *
 * Run: node scripts/transform-pixabay.mjs
 * Outputs:
 *   public/data/pb/meta.json          — total, chunkCount, types
 *   public/data/pb/chunks/{n}.json    — 200 items each, sorted by views desc
 *   public/data/pb/tags/{slug}.json   — top 2000 tags, up to 100 items each
 *   src/data/pb/featured.json         — top 48 items (for SSG landing pages)
 *   src/data/pb/featured-photos.json  — top 24 photos
 *   src/data/pb/featured-illus.json   — top 12 illustrations
 *   src/data/pb/featured-vectors.json — top 12 vectors
 *   src/data/pb/top-tags.json         — [{tag, slug, count}] top 2000 tags
 */

import { createReadStream, mkdirSync, writeFileSync, rmSync } from 'fs';
import { createInterface }  from 'readline';
import { fileURLToPath }    from 'url';
import { dirname, join }    from 'path';

const __dir     = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dir, '..');
const INPUT     = join(ROOT, 'general.jsonl');
const CHUNK_DIR = join(ROOT, 'public', 'data', 'pb', 'chunks');
const TAGS_DIR  = join(ROOT, 'public', 'data', 'pb', 'tags');
const META_DIR  = join(ROOT, 'public', 'data', 'pb');
const SRC_PB    = join(ROOT, 'src', 'data', 'pb');
const CHUNK_SIZE    = 200;
const MAX_CHUNKS    = 50;   // commit top 10,000 items (by views) — ~18MB total
const TOP_TAGS      = 2000; // tag pages built for SEO (getStaticPaths)
const TAG_FILE_TAGS = 500;  // tag files served at /data/pb/tags/ — top 500 only
const TAG_ITEMS     = 50;   // items per tag file (fewer = smaller files)

// Clear output dirs so stale files from previous runs don't remain
rmSync(CHUNK_DIR, { recursive: true, force: true });
rmSync(TAGS_DIR,  { recursive: true, force: true });

mkdirSync(CHUNK_DIR, { recursive: true });
mkdirSync(TAGS_DIR,  { recursive: true });
mkdirSync(SRC_PB,    { recursive: true });

// ── Category inference ────────────────────────────────────────────────────────
const CAT_RULES = [
  { cat: 'flowers',      words: ['flower','flowers','blossom','bloom','petal','rose','tulip','daisy','orchid','sunflower','lavender','cherry blossom'] },
  { cat: 'wildlife',     words: ['wildlife','bird','animal','dog','cat','bear','lion','tiger','wolf','deer','fox','horse','eagle','butterfly','insect','bee'] },
  { cat: 'food',         words: ['food','fruit','vegetable','meal','cake','bread','coffee','pizza','salad','cook','kitchen','eat','drink'] },
  { cat: 'sky',          words: ['sky','clouds','cloud','sunset','sunrise','sunrise','moon','stars','star','aurora','lightning','storm','rainbow'] },
  { cat: 'people',       words: ['people','person','man','woman','girl','boy','child','baby','portrait','face','hands','family','crowd'] },
  { cat: 'travel',       words: ['travel','vacation','holiday','landmark','tourism','beach','sea','ocean','coast','island','bridge','castle','ruins'] },
  { cat: 'macro',        words: ['macro','close-up','closeup','detail','dew','drop','texture','surface'] },
  { cat: 'nature',       words: ['nature','forest','tree','trees','mountain','mountains','lake','river','waterfall','grass','meadow','landscape','park','garden','leaf','leaves','plant','wood','fog','mist'] },
  { cat: 'urban',        words: ['city','building','buildings','architecture','urban','street','road','bridge','skyscraper','night','downtown','traffic','construction'] },
  { cat: 'abstract',     words: ['abstract','pattern','texture','background','wallpaper','gradient','fractal','geometry','colorful','art'] },
  { cat: 'minimal',      words: ['minimal','minimalism','minimalist','clean','simple','white','black','negative space'] },
  { cat: 'cinematic',    words: ['cinematic','film','movie','dramatic','moody','dark','noir'] },
  { cat: 'illustration', words: ['illustration','cartoon','drawing','sketch','comic','icon','logo','symbol','clipart','graphic'] },
];

function inferCategory(type, tagArr) {
  if (type === 'illustration' || type === 'vector/svg') return 'illustration';
  const tagSet = new Set(tagArr.map(t => t.toLowerCase()));
  for (const { cat, words } of CAT_RULES) {
    if (words.some(w => tagSet.has(w) || [...tagSet].some(t => t.includes(w)))) return cat;
  }
  return 'nature';
}

// ── Map type ─────────────────────────────────────────────────────────────────
function mapType(t) {
  if (t === 'photo')        return 'photo';
  if (t === 'illustration') return 'illustration';
  return 'vector'; // vector/svg
}

// ── SEO title (≤ 60 chars) ───────────────────────────────────────────────────
function buildTitle(name, type) {
  const base = (name || '').replace(/,\s*/g, ' ').trim();
  const words = base.split(' ').slice(0, 5).join(' ');
  const label = type === 'photo' ? 'Free Photo' : type === 'illustration' ? 'Free Illustration' : 'Free Vector';
  const title = `${cap(words)} — ${label}`;
  return title.length > 60 ? title.slice(0, 57) + '...' : title;
}

// ── SEO description (≤ 160 chars) ────────────────────────────────────────────
function buildDesc(tags, type) {
  const subject = tags.slice(0, 4).join(', ');
  if (type === 'photo') {
    return `Free high-resolution photo of ${subject}. Download royalty-free for personal and commercial use — no attribution required.`;
  }
  if (type === 'illustration') {
    return `Free illustration of ${subject}. Royalty-free digital artwork — download for personal or commercial use, no attribution needed.`;
  }
  return `Free vector/SVG of ${subject}. Download royalty-free for any project — personal or commercial, no attribution required.`;
}

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function computeOrientation(w, h) {
  if (w > h * 1.1) return 'landscape';
  if (h > w * 1.1) return 'portrait';
  return 'square';
}

function slugifyTag(t) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ── Read + transform ──────────────────────────────────────────────────────────
console.log('Reading general.jsonl …');
const t0 = Date.now();

const records = [];
const tagFreq = {}; // tag → count

const rl = createInterface({ input: createReadStream(INPUT, { encoding: 'utf-8' }) });

for await (const line of rl) {
  if (!line.trim()) continue;
  const r = JSON.parse(line);

  // Exclude adult content and AI-generated
  if (!r.isGRated || r.isAiGenerated) continue;
  // isLowQuality is KEPT per user request

  const rawTags = (r.tags || '').split(',').map(t => t.trim()).filter(Boolean);
  const type    = mapType(r.type);
  const cat     = inferCategory(r.type, rawTags);

  // Count tag frequencies
  for (const t of rawTags) {
    const s = t.toLowerCase();
    tagFreq[s] = (tagFreq[s] || 0) + 1;
  }

  const imageW = r.webformatWidth  || r.previewWidth  || 640;
  const imageH = r.webformatHeight || r.previewHeight || 480;
  const aspect = imageW && imageH ? `${imageW}:${imageH}` : '4:3';
  const tags   = rawTags.map(t => t.toLowerCase());

  const title = buildTitle(r.name, type);
  records.push({
    id:           `px-${r.id}`,
    type,
    division:     'sight',
    slug:         `px-${r.id}`,
    title,
    description:  buildDesc(rawTags, type),
    creator:      `px-user-${r.user_id}`,
    creatorName:  r.user || 'Unknown',
    creatorAvatar: r.userImageURL || '',
    thumbnail:    r.previewURL,
    category:     cat,
    tags,
    moods:        [],
    styles:       [],
    colors:       [],
    orientation:  computeOrientation(imageW, imageH),
    license:      'pixabay',
    attribution:  r.user || '',
    source:       'pixabay',
    featured:     false,
    trending:     (r.views || 0) > 50000,
    editorsPick:  (r.views || 0) > 100000,
    stats: {
      views:     r.views     || 0,
      downloads: r.downloads || 0,
      likes:     r.likes     || 0,
      saves:     0,
    },
    createdAt:    '',
    updatedAt:    '',
    seo: {
      title,
      description: buildDesc(rawTags, type),
      keywords:    [...tags.slice(0, 8), 'free image', 'royalty free', 'no attribution'],
    },
    data: {
      width:        r.imageWidth  || imageW,
      height:       r.imageHeight || imageH,
      aspectRatio:  aspect,
      format:       'jpg',
      thumbnailUrl: r.previewURL,
      previewUrl:   r.webformatURL,
      fullUrl:      r.largeImageURL,
      altText:      `${title} — free royalty-free download`,
      colors:       [],
    },
  });
}

console.log(`Parsed ${records.length.toLocaleString()} usable records in ${((Date.now()-t0)/1000).toFixed(1)}s`);

// Sort by views DESC (popular first in chunks)
records.sort((a, b) => b.stats.views - a.stats.views);

// ── Write chunks (top MAX_CHUNKS only for git budget) ────────────────────────
console.log(`Writing top ${MAX_CHUNKS} chunks (${MAX_CHUNKS * CHUNK_SIZE} most-viewed items) …`);
const totalChunks = Math.ceil(records.length / CHUNK_SIZE);
const chunksToWrite = Math.min(MAX_CHUNKS, totalChunks);
for (let i = 0; i < chunksToWrite; i++) {
  const slice = records.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
  writeFileSync(join(CHUNK_DIR, `${i}.json`), JSON.stringify(slice));
}
console.log(`  → ${chunksToWrite} chunks written (${totalChunks} total, rest excluded from git)`);

// ── Write meta ────────────────────────────────────────────────────────────────
const byType = records.reduce((acc, r) => { acc[r.type] = (acc[r.type]||0)+1; return acc; }, {});
writeFileSync(join(META_DIR, 'meta.json'), JSON.stringify({
  total:        records.length,
  chunkCount:   chunksToWrite, // only committed chunks
  totalChunks,                 // all generated chunks
  chunkSize:    CHUNK_SIZE,
  byType,
  generatedAt:  new Date().toISOString(),
}));
console.log('  → meta.json');

// ── Top tags ─────────────────────────────────────────────────────────────────
console.log('Building tag index …');
const sortedTags = Object.entries(tagFreq)
  .sort((a, b) => b[1] - a[1])
  .slice(0, TOP_TAGS);

const topTagsList = sortedTags.map(([tag, count]) => ({
  tag,
  slug: slugifyTag(tag),
  count,
}));
writeFileSync(join(SRC_PB, 'top-tags.json'), JSON.stringify(topTagsList));
console.log(`  → top-tags.json (${topTagsList.length} tags)`);

// ── Per-tag files ─────────────────────────────────────────────────────────────
const tagMap = new Map(); // tagSlug → [record, ...]
for (const r of records) {
  for (const t of r.tags) {
    const s = slugifyTag(t);
    if (!tagMap.has(s)) tagMap.set(s, []);
    tagMap.get(s).push(r);
  }
}

let tagFilesWritten = 0;
for (const { tag, slug } of topTagsList.slice(0, TAG_FILE_TAGS)) {
  const items = (tagMap.get(slug) || tagMap.get(slugifyTag(tag)) || [])
    .slice(0, TAG_ITEMS)
    .map(r => ({
      id: r.id, slug: r.slug, type: r.type, title: r.title,
      thumbnail: r.thumbnail, thumbnailWidth: r.data?.width,
      thumbnailHeight: r.data?.height, orientation: r.orientation,
      tags: r.tags.slice(0, 6), views: r.stats.views,
      previewUrl: r.data?.previewUrl,
    }));
  writeFileSync(join(TAGS_DIR, `${slug}.json`), JSON.stringify({ tag, total: (tagMap.get(slug)||[]).length, items }));
  tagFilesWritten++;
}
console.log(`  → ${tagFilesWritten} tag files`);

// ── Featured snapshots for SSG pages ─────────────────────────────────────────
console.log('Writing SSG featured snapshots …');

const thin = (r) => ({
  id: r.id, slug: r.slug, type: r.type, title: r.title, description: r.description,
  thumbnail: r.thumbnail, orientation: r.orientation, tags: r.tags.slice(0,6),
  category: r.category, license: r.license, stats: r.stats,
  data: { thumbnailUrl: r.data.thumbnailUrl, previewUrl: r.data.previewUrl, fullUrl: r.data.fullUrl, altText: r.data.altText, width: r.data.width, height: r.data.height, aspectRatio: r.data.aspectRatio, format: r.data.format, colors: [] },
  seo: r.seo, creator: r.creator, creatorName: r.creatorName, creatorAvatar: r.creatorAvatar,
  division: r.division, moods: [], styles: [], colors: [], featured: r.featured,
  trending: r.trending, editorsPick: r.editorsPick, source: r.source, quality: r.quality,
  createdAt: r.createdAt, updatedAt: r.updatedAt,
});

const photos  = records.filter(r => r.type === 'photo');
const illus   = records.filter(r => r.type === 'illustration');
const vectors = records.filter(r => r.type === 'vector');

writeFileSync(join(SRC_PB, 'featured.json'),         JSON.stringify(records.slice(0, 48).map(thin)));
writeFileSync(join(SRC_PB, 'featured-photos.json'),  JSON.stringify(photos.slice(0, 24).map(thin)));
writeFileSync(join(SRC_PB, 'featured-illus.json'),   JSON.stringify(illus.slice(0, 12).map(thin)));
writeFileSync(join(SRC_PB, 'featured-vectors.json'), JSON.stringify(vectors.slice(0, 12).map(thin)));
console.log('  → featured.json, featured-photos.json, featured-illus.json, featured-vectors.json');

const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`\nDone in ${elapsed}s — ${records.length.toLocaleString()} records, ${chunksToWrite} chunks committed, ${tagFilesWritten} tag files.`);
