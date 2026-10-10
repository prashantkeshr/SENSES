/**
 * transform-3d.mjs
 * Converts pixabay_3d_dataset.jsonl (1,756 GLB models) into static JSON for SIGHT.
 * Small enough to commit ALL records in one file.
 * Run: node scripts/transform-3d.mjs
 *
 * Outputs:
 *   public/data/pb/3d/all.json       — all 1,756 models
 *   src/data/pb/3d-stats.json        — totals + category breakdown
 *   src/data/pb/featured-3d.json     — top 24 by tag diversity
 */

import { createReadStream, mkdirSync, writeFileSync, rmSync } from 'fs';
import { createInterface } from 'readline';
import { fileURLToPath }   from 'url';
import { dirname, join }   from 'path';

const __dir   = dirname(fileURLToPath(import.meta.url));
const ROOT    = join(__dir, '..');
const INPUT   = 'C:\\Users\\prash\\OneDrive\\Projects\\scaps\\pixabay_3d_harvest\\pixabay_3d_dataset.jsonl';
const OUT_DIR = join(ROOT, 'public', 'data', 'pb', '3d');
const SRC_PB  = join(ROOT, 'src', 'data', 'pb');

rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(SRC_PB,  { recursive: true });

function slugify(t) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Infer category from tags for 3D models
const CAT_RULES_3D = [
  { cat: 'architecture', words: ['building','house','architecture','interior','room','furniture','door','window','wall','floor','ceiling'] },
  { cat: 'vehicles',     words: ['car','vehicle','truck','motorcycle','bike','plane','ship','boat','aircraft','train'] },
  { cat: 'nature',       words: ['tree','plant','flower','rock','stone','mountain','terrain','grass','leaf','animal'] },
  { cat: 'characters',   words: ['character','person','human','robot','creature','monster','fantasy','figure','avatar'] },
  { cat: 'food',         words: ['food','drink','fruit','vegetable','meal','cake','coffee','glass','cup','bottle'] },
  { cat: 'space',        words: ['space','planet','star','rocket','satellite','astronaut','solar','galaxy','universe'] },
  { cat: 'weapons',      words: ['weapon','sword','gun','shield','armor','knight','medieval','war'] },
  { cat: 'electronics',  words: ['phone','computer','keyboard','device','tech','electronic','screen','gadget'] },
  { cat: 'abstract',     words: ['abstract','geometric','pattern','art','design','logo','symbol','icon'] },
  { cat: 'objects',      words: [] }, // default
];

function inferCategory3D(tags) {
  const lower = tags.map(t => t.toLowerCase()).join(' ');
  for (const { cat, words } of CAT_RULES_3D) {
    if (words.length && words.some(w => lower.includes(w))) return cat;
  }
  return 'objects';
}

console.log('Reading pixabay_3d_dataset.jsonl …');
const t0 = Date.now();
const records = [];

const rl = createInterface({ input: createReadStream(INPUT, { encoding: 'utf-8' }) });
for await (const line of rl) {
  if (!line.trim()) continue;
  const r = JSON.parse(line);

  if (!r.model_origin_glb_link || !r.cdn_preview_png) continue;

  const tags     = (r.tags || []).map(t => t.toString().toLowerCase()).filter(Boolean);
  const cat      = inferCategory3D(tags);
  const slug     = `p3d-${r.asset_id}`;
  const name     = r.model_name || r.title || 'Untitled 3D Model';
  const title    = `${name} — Free 3D Model`;
  const desc     = r.description || `Free 3D model of ${name}. Download in GLB format — royalty-free, no attribution required. Free for personal and commercial use.`;
  const author   = r.author?.name || 'Unknown';

  records.push({
    id:            slug,
    type:          'model',
    division:      'sight',
    slug,
    title,
    modelName:     name,
    description:   desc,
    creator:       `p3d-user-${slugify(author)}`,
    creatorName:   author,
    creatorAvatar: '',
    thumbnail:     r.cdn_preview_png,
    category:      cat,
    tags,
    orientation:   'square',
    license:       'pixabay',
    source:        'pixabay',
    featured:      false,
    trending:      false,
    editorsPick:   false,
    stats:         { views: 0, downloads: 0, likes: 0 },
    datePublished: r.date_published || '',
    data: {
      modelUrl:   r.model_origin_glb_link,
      previewUrl: r.cdn_preview_png,
      format:     'glb',
    },
    seo: {
      title,
      description: desc,
      keywords: [...tags.slice(0, 8), 'free 3d model', 'glb model', 'royalty free 3d'],
    },
  });
}

console.log(`Parsed ${records.length.toLocaleString()} 3D models in ${((Date.now()-t0)/1000).toFixed(1)}s`);

// Write all in one file (small enough)
writeFileSync(join(OUT_DIR, 'all.json'), JSON.stringify(records));
console.log(`→ 3d/all.json (${records.length} models)`);

// Category breakdown
const byCat = records.reduce((a,r) => { a[r.category]=(a[r.category]||0)+1; return a; }, {});
writeFileSync(join(SRC_PB, '3d-stats.json'), JSON.stringify({
  total: records.length, byCategory: byCat, generatedAt: new Date().toISOString(),
}));
console.log(`→ 3d-stats.json`);

// Featured: diverse selection across categories
const featured = [];
const seen = new Set();
for (const cat of Object.keys(byCat)) {
  const pick = records.filter(r => r.category === cat && !seen.has(r.id)).slice(0, 3);
  pick.forEach(r => { featured.push(r); seen.add(r.id); });
  if (featured.length >= 24) break;
}
// Fill remaining if needed
if (featured.length < 24) {
  for (const r of records) {
    if (!seen.has(r.id)) { featured.push(r); seen.add(r.id); }
    if (featured.length >= 24) break;
  }
}
writeFileSync(join(SRC_PB, 'featured-3d.json'), JSON.stringify(featured.slice(0, 24)));
console.log(`→ featured-3d.json (${Math.min(featured.length,24)} items)`);
console.log(`Done in ${((Date.now()-t0)/1000).toFixed(1)}s`);
