/**
 * transform-videos.mjs
 * Converts videos.jsonl (11,813 Pixabay videos) into chunked static JSON for SIGHT.
 * Run: node scripts/transform-videos.mjs
 *
 * Outputs:
 *   public/data/pb/videos/chunks/{n}.json  — 30 items each, sorted by views desc
 *   public/data/pb/videos/tags/{slug}.json — top 300 tag files, 30 items each
 *   src/data/pb/video-stats.json           — totals for SSG pages
 *   src/data/pb/featured-videos.json       — top 24 for hero/landing
 */

import { createReadStream, mkdirSync, writeFileSync, rmSync } from 'fs';
import { createInterface } from 'readline';
import { fileURLToPath }   from 'url';
import { dirname, join }   from 'path';

const __dir      = dirname(fileURLToPath(import.meta.url));
const ROOT       = join(__dir, '..');
const INPUT      = 'C:\\Users\\prash\\OneDrive\\Projects\\scaps\\pixabay_videos_dataset\\videos.jsonl';
const CHUNK_DIR  = join(ROOT, 'public', 'data', 'pb', 'videos', 'chunks');
const TAGS_DIR   = join(ROOT, 'public', 'data', 'pb', 'videos', 'tags');
const SRC_PB     = join(ROOT, 'src', 'data', 'pb');

const CHUNK_SIZE   = 30;
const MAX_CHUNKS   = 50;   // top 1,500 videos
const TAG_FILES    = 300;  // tag files
const TAG_ITEMS    = 30;

rmSync(CHUNK_DIR, { recursive: true, force: true });
rmSync(TAGS_DIR,  { recursive: true, force: true });
mkdirSync(CHUNK_DIR, { recursive: true });
mkdirSync(TAGS_DIR,  { recursive: true });
mkdirSync(SRC_PB,    { recursive: true });

function slugify(t) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function formatDuration(s) {
  const m = Math.floor(s / 60), sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

function buildVideoTitle(name, type) {
  const words = (name || '').replace(/,\s*/g, ' ').trim().split(' ').slice(0, 5).join(' ');
  const label = type === 'animation' ? 'Free Animation' : 'Free Stock Video';
  const title = `${words.charAt(0).toUpperCase() + words.slice(1)} — ${label}`;
  return title.length > 60 ? title.slice(0, 57) + '...' : title;
}

// Pick best available video quality
function pickUrls(videos) {
  const best = videos.large?.url && videos.large.width > 0 ? videos.large
             : videos.medium?.url ? videos.medium
             : videos.small?.url  ? videos.small
             : videos.tiny;
  const preview = videos.medium || videos.small || videos.tiny || {};
  return {
    streamUrl:    (videos.medium?.url || videos.small?.url || videos.tiny?.url || ''),
    fullUrl:      (best?.url || ''),
    thumbnail:    (videos.medium?.thumbnail || videos.small?.thumbnail || videos.large?.thumbnail || ''),
    width:        preview.width  || 1280,
    height:       preview.height || 720,
  };
}

console.log('Reading videos.jsonl …');
const t0 = Date.now();
const records = [];
const tagFreq = {};

const rl = createInterface({ input: createReadStream(INPUT, { encoding: 'utf-8' }) });
for await (const line of rl) {
  if (!line.trim()) continue;
  const r = JSON.parse(line);
  if (!r.isGRated || r.isAiGenerated) continue;

  const rawTags = (r.tags || '').split(',').map(t => t.trim()).filter(Boolean);
  const tags    = rawTags.map(t => t.toLowerCase());
  const urls    = pickUrls(r.videos || {});
  if (!urls.streamUrl) continue; // skip if no playable URL

  for (const t of tags) tagFreq[slugify(t)] = (tagFreq[slugify(t)] || 0) + 1;

  const type  = r.type; // 'animation' | 'film'
  const title = buildVideoTitle(r.name, type);
  const desc  = `Free ${type === 'animation' ? 'animation' : 'stock video'} of ${rawTags.slice(0, 4).join(', ')}. Download royalty-free — no attribution required.`;

  records.push({
    id:           `pvid-${r.id}`,
    type:         'video',
    videoType:    type,           // 'animation' | 'film'
    division:     'sight',
    slug:         `pvid-${r.id}`,
    title,
    description:  desc,
    creator:      `pvid-user-${r.user_id}`,
    creatorName:  r.user || 'Unknown',
    creatorAvatar: r.userImageURL || '',
    thumbnail:    urls.thumbnail,
    category:     type === 'animation' ? 'animation' : 'cinematic',
    tags,
    orientation:  urls.width > urls.height ? 'landscape' : 'portrait',
    license:      'pixabay',
    source:       'pixabay',
    featured:     false,
    trending:     (r.views || 0) > 100000,
    editorsPick:  (r.views || 0) > 500000,
    stats: {
      views:     r.views     || 0,
      downloads: r.downloads || 0,
      likes:     r.likes     || 0,
      comments:  r.comments  || 0,
    },
    data: {
      streamUrl:  urls.streamUrl,
      fullUrl:    urls.fullUrl,
      thumbnail:  urls.thumbnail,
      width:      urls.width,
      height:     urls.height,
      duration:   r.duration || 0,
      durationFmt: formatDuration(r.duration || 0),
      format:     'mp4',
    },
    seo: {
      title,
      description: desc,
      keywords: [...tags.slice(0, 8), 'free video', 'royalty free video', 'stock footage'],
    },
  });
}

console.log(`Parsed ${records.length.toLocaleString()} videos in ${((Date.now()-t0)/1000).toFixed(1)}s`);
records.sort((a, b) => b.stats.views - a.stats.views);

// Chunks
const toWrite = Math.min(MAX_CHUNKS, Math.ceil(records.length / CHUNK_SIZE));
for (let i = 0; i < toWrite; i++) {
  const slice = records.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
  writeFileSync(join(CHUNK_DIR, `${i}.json`), JSON.stringify(slice));
}
console.log(`→ ${toWrite} video chunks`);

// Tag files
const tagMap = new Map();
for (const r of records) {
  for (const t of r.tags) {
    const s = slugify(t);
    if (!tagMap.has(s)) tagMap.set(s, []);
    tagMap.get(s).push(r);
  }
}
const sortedTags = Object.entries(tagFreq).sort((a,b) => b[1]-a[1]).slice(0, TAG_FILES);
for (const [slug] of sortedTags) {
  const items = (tagMap.get(slug) || []).slice(0, TAG_ITEMS).map(r => ({
    id: r.id, slug: r.slug, type: r.type, videoType: r.videoType,
    title: r.title, thumbnail: r.data.thumbnail,
    duration: r.data.duration, durationFmt: r.data.durationFmt,
    width: r.data.width, height: r.data.height,
    tags: r.tags.slice(0, 6), views: r.stats.views,
    streamUrl: r.data.streamUrl,
  }));
  writeFileSync(join(TAGS_DIR, `${slug}.json`), JSON.stringify({ slug, items }));
}
console.log(`→ ${sortedTags.length} video tag files`);

// Stats + featured
const byType = records.reduce((a,r) => { a[r.videoType]=(a[r.videoType]||0)+1; return a; }, {});
writeFileSync(join(SRC_PB, 'video-stats.json'), JSON.stringify({
  total: records.length, byType, generatedAt: new Date().toISOString(),
}));

const thinVideo = r => ({
  id: r.id, slug: r.slug, type: r.type, videoType: r.videoType,
  title: r.title, description: r.description, thumbnail: r.data.thumbnail,
  category: r.category, tags: r.tags.slice(0,6), license: r.license,
  stats: r.stats, data: r.data, seo: r.seo, creator: r.creator,
  creatorName: r.creatorName, creatorAvatar: r.creatorAvatar,
  division: r.division, featured: r.featured, trending: r.trending,
  editorsPick: r.editorsPick, source: r.source, orientation: r.orientation,
});
writeFileSync(join(SRC_PB, 'featured-videos.json'), JSON.stringify(records.slice(0,24).map(thinVideo)));
console.log(`→ video-stats.json + featured-videos.json`);
console.log(`Done in ${((Date.now()-t0)/1000).toFixed(1)}s`);
