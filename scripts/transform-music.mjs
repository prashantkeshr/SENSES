/**
 * transform-music.mjs
 * Converts extracted_music.jsonl (10,109 tracks) into chunked static JSON for HEARING.
 * Run: node scripts/transform-music.mjs
 *
 * Outputs:
 *   public/data/pb/music/chunks/{n}.json  — 100 items each, sorted by likes desc
 *   public/data/pb/music/tags/{slug}.json — top 300 genre tag files, 50 items each
 *   src/data/pb/music-stats.json          — totals for SSG pages
 *   src/data/pb/featured-music.json       — top 24 for hero/landing
 */

import { createReadStream, mkdirSync, writeFileSync, rmSync } from 'fs';
import { createInterface } from 'readline';
import { fileURLToPath }   from 'url';
import { dirname, join }   from 'path';

const __dir      = dirname(fileURLToPath(import.meta.url));
const ROOT       = join(__dir, '..');
const INPUT      = 'C:\\Users\\prash\\OneDrive\\Projects\\scaps\\pixabay_audio_dataset\\extracted_music.jsonl';
const CHUNK_DIR  = join(ROOT, 'public', 'data', 'pb', 'music', 'chunks');
const TAGS_DIR   = join(ROOT, 'public', 'data', 'pb', 'music', 'tags');
const SRC_PB     = join(ROOT, 'src', 'data', 'pb');

const CHUNK_SIZE = 100;
const MAX_CHUNKS = 50;   // top 5,000 tracks
const TAG_FILES  = 300;
const TAG_ITEMS  = 50;

rmSync(CHUNK_DIR, { recursive: true, force: true });
rmSync(TAGS_DIR,  { recursive: true, force: true });
mkdirSync(CHUNK_DIR, { recursive: true });
mkdirSync(TAGS_DIR,  { recursive: true });
mkdirSync(SRC_PB,    { recursive: true });

function slugify(t) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function formatDuration(s) {
  const m = Math.floor(s / 60), sec = Math.round(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}

// Extract numeric ID from source_page_url
// e.g. "https://pixabay.com/music/rock-surf-rock-611687/" → "611687"
function extractId(url) {
  const match = url.match(/-(\d+)\/?$/);
  return match ? match[1] : null;
}

// Infer primary genre from tags array
const GENRE_MAP = [
  { genre: 'rock',        words: ['rock','metal','punk','grunge','guitar','riff'] },
  { genre: 'electronic',  words: ['electronic','edm','techno','house','trance','synthwave','dubstep','beats'] },
  { genre: 'jazz',        words: ['jazz','blues','swing','bebop','soul','groove','funk'] },
  { genre: 'classical',   words: ['classical','orchestra','piano','violin','cello','strings','chamber','baroque'] },
  { genre: 'ambient',     words: ['ambient','meditation','relaxing','calm','sleep','spa','nature','mindfulness'] },
  { genre: 'pop',         words: ['pop','upbeat','catchy','feel good','happy','fun','dance','party'] },
  { genre: 'cinematic',   words: ['cinematic','epic','dramatic','trailer','orchestral','score','soundtrack'] },
  { genre: 'folk',        words: ['folk','acoustic','country','western','bluegrass','singer','guitar acoustic'] },
  { genre: 'hip-hop',     words: ['hip hop','hip-hop','rap','trap','urban','beats','lo-fi','lofi'] },
  { genre: 'world',       words: ['world','ethnic','tribal','latin','african','asian','indian','celtic'] },
];

function inferGenre(tags) {
  const lower = tags.map(t => t.toLowerCase()).join(' ');
  for (const { genre, words } of GENRE_MAP) {
    if (words.some(w => lower.includes(w))) return genre;
  }
  return 'other';
}

console.log('Reading extracted_music.jsonl …');
const t0 = Date.now();
const records = [];
const tagFreq = {};

const rl = createInterface({ input: createReadStream(INPUT, { encoding: 'utf-8' }) });
for await (const line of rl) {
  if (!line.trim()) continue;
  const r = JSON.parse(line);

  const id = extractId(r.source_page_url);
  if (!id || !r.direct_audio_stream_url) continue;

  const tags = (r.tags || []).map(t => t.toLowerCase()).filter(Boolean);
  for (const t of tags) {
    const s = slugify(t);
    tagFreq[s] = (tagFreq[s] || 0) + 1;
  }

  const genre  = inferGenre(tags);
  const slug   = `pmus-${id}`;
  const title  = r.track_name || 'Untitled Track';
  const artist = r.artist_name || 'Unknown Artist';
  const dur    = r.duration_seconds || 0;
  const desc   = `Free music track "${title}" by ${artist}. Genre: ${genre}. Duration: ${formatDuration(dur)}. Royalty-free — no attribution required. Free for personal and commercial use.`;

  records.push({
    id:            slug,
    type:          'track',
    division:      'hearing',
    slug,
    title,
    description:   desc,
    creator:       `pmus-user-${slugify(artist)}`,
    creatorName:   artist,
    creatorAvatar: r.artist_avatar_url || '',
    thumbnail:     r.album_cover_thumbnail_url || '',
    category:      genre,
    tags,
    moods:         [],
    styles:        [],
    colors:        [],
    orientation:   'square',
    license:       'pixabay',
    source:        'pixabay',
    featured:      false,
    trending:      (r.likes_count || 0) > 5000,
    editorsPick:   (r.likes_count || 0) > 10000,
    stats: {
      views:     r.views_count     || 0,
      downloads: r.downloads_count || 0,
      likes:     r.likes_count     || 0,
    },
    createdAt:     r.scraped_at || '',
    data: {
      streamUrl:   r.direct_audio_stream_url,
      artworkUrl:  r.album_cover_thumbnail_url || '',
      downloadUrl: r.download_url || '',
      duration:    dur,
      durationFmt: formatDuration(dur),
      format:      r.file_format || 'MP3',
      waveformData: [],
    },
    seo: {
      title:       `${title} — Free Music by ${artist} | Senses`,
      description: desc,
      keywords:    [...tags.slice(0, 8), 'free music', 'royalty free music', 'no copyright music'],
    },
  });
}

console.log(`Parsed ${records.length.toLocaleString()} tracks in ${((Date.now()-t0)/1000).toFixed(1)}s`);
records.sort((a, b) => b.stats.likes - a.stats.likes);

// Chunks
const toWrite = Math.min(MAX_CHUNKS, Math.ceil(records.length / CHUNK_SIZE));
for (let i = 0; i < toWrite; i++) {
  const slice = records.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
  writeFileSync(join(CHUNK_DIR, `${i}.json`), JSON.stringify(slice));
}
console.log(`→ ${toWrite} music chunks`);

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
    id: r.id, slug: r.slug, type: r.type,
    title: r.title, creatorName: r.creatorName, thumbnail: r.thumbnail,
    duration: r.data.duration, durationFmt: r.data.durationFmt,
    tags: r.tags.slice(0, 6), likes: r.stats.likes,
    audioUrl: r.data.audioUrl, category: r.category,
  }));
  writeFileSync(join(TAGS_DIR, `${slug}.json`), JSON.stringify({ slug, items }));
}
console.log(`→ ${sortedTags.length} music tag files`);

// Genre frequency
const byGenre = records.reduce((a,r) => { a[r.category]=(a[r.category]||0)+1; return a; }, {});
writeFileSync(join(SRC_PB, 'music-stats.json'), JSON.stringify({
  total: records.length, byGenre, generatedAt: new Date().toISOString(),
}));

const thin = r => ({
  id: r.id, slug: r.slug, type: r.type, title: r.title,
  description: r.description, creatorName: r.creatorName, creatorAvatar: r.creatorAvatar,
  thumbnail: r.thumbnail, category: r.category, tags: r.tags.slice(0,6),
  license: r.license, stats: r.stats, data: r.data, seo: r.seo,
  creator: r.creator, division: r.division, featured: r.featured,
  trending: r.trending, editorsPick: r.editorsPick, source: r.source,
  createdAt: r.createdAt,
});
writeFileSync(join(SRC_PB, 'featured-music.json'), JSON.stringify(records.slice(0,24).map(thin)));
console.log(`→ music-stats.json + featured-music.json`);
console.log(`Done in ${((Date.now()-t0)/1000).toFixed(1)}s`);
