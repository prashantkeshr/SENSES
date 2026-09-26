/**
 * transform-pixabay.mjs
 * Reads C:\Users\prash\OneDrive\Projects\Claude project\sight\general.json
 * Filters, maps to SENSES Media format, and merges with existing data.
 * Run from senses/ directory: node scripts/transform-pixabay.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = resolve(__dirname, '..');
const SRC       = resolve(ROOT, 'src/data');
const INPUT     = resolve(ROOT, '../sight/general.json');

// ─── Mood / style / category keyword maps ────────────────────────────────────

const MOOD_KEYWORDS = {
  peaceful:      ['peace', 'calm', 'quiet', 'serene', 'tranquil', 'still', 'gentle', 'soft'],
  meditative:    ['meditat', 'zen', 'mindful', 'yoga', 'spiritual', 'sacred'],
  'awe-inspiring': ['epic', 'majestic', 'grand', 'vast', 'incredible', 'stunning', 'breathtaking'],
  romantic:      ['romantic', 'love', 'couple', 'wedding', 'heart', 'rose', 'blossom', 'bloom'],
  joyful:        ['joy', 'happy', 'fun', 'bright', 'cheerful', 'smile', 'laugh', 'celebration'],
  dramatic:      ['drama', 'storm', 'thunder', 'lightning', 'dark', 'moody', 'contrast', 'shadow'],
  cinematic:     ['cinematic', 'film', 'movie', 'widescreen', 'bokeh', 'dramatic light'],
  energetic:     ['energy', 'action', 'sport', 'run', 'jump', 'dance', 'motion', 'speed'],
  mysterious:    ['mystery', 'fog', 'mist', 'shadow', 'forest', 'dark', 'depth', 'hidden'],
  nostalgic:     ['vintage', 'retro', 'old', 'classic', 'memory', 'past', 'antique', 'aged'],
  grounding:     ['earth', 'soil', 'rock', 'mountain', 'ground', 'stone', 'roots', 'terrain'],
  adventurous:   ['adventure', 'explore', 'travel', 'journey', 'road', 'trail', 'hike', 'wild'],
  wanderlust:    ['travel', 'wanderlust', 'destination', 'landscape', 'world', 'global', 'trip'],
  inspiring:     ['inspire', 'motivation', 'success', 'goal', 'dream', 'vision', 'achieve'],
  intimate:      ['portrait', 'close', 'face', 'eye', 'expression', 'emotion', 'personal'],
  emotional:     ['emotion', 'feel', 'sentimental', 'tender', 'touching', 'moving'],
  playful:       ['play', 'fun', 'cute', 'kitten', 'puppy', 'child', 'kid', 'toy', 'baby'],
  warm:          ['warm', 'golden', 'sunset', 'autumn', 'cozy', 'fire', 'orange', 'amber'],
  focused:       ['work', 'study', 'desk', 'focus', 'minimal', 'clean', 'simple', 'office'],
  creative:      ['art', 'creative', 'design', 'craft', 'paint', 'draw', 'digital', 'color'],
  sensory:       ['food', 'texture', 'macro', 'close-up', 'detail', 'surface', 'pattern'],
  curious:       ['macro', 'detail', 'close-up', 'insect', 'micro', 'tiny', 'small'],
  serene:        ['lake', 'reflection', 'water', 'still', 'glass', 'mirror', 'pond'],
};

const STYLE_KEYWORDS = {
  'landscape-photography': ['landscape', 'mountain', 'valley', 'canyon', 'panorama', 'vista'],
  'macro-photography':     ['macro', 'close-up', 'detail', 'insect', 'dew', 'drop', 'petal'],
  'portrait-photography':  ['portrait', 'face', 'expression', 'model', 'headshot', 'close'],
  'street-photography':    ['street', 'city', 'urban', 'people', 'crowd', 'sidewalk'],
  'wildlife-photography':  ['animal', 'bird', 'wildlife', 'lion', 'tiger', 'elephant', 'wolf'],
  'botanical-art':         ['flower', 'plant', 'bloom', 'blossom', 'leaf', 'garden', 'botanical'],
  'aerial-photography':    ['aerial', 'drone', 'above', 'bird eye', 'top view', 'overhead'],
  'black-and-white':       ['black white', 'monochrome', 'grayscale', 'noir', 'contrast'],
  'long-exposure':         ['long exposure', 'light trail', 'silk water', 'star trail', 'motion blur'],
  'golden-hour':           ['golden hour', 'sunset', 'sunrise', 'dusk', 'dawn', 'warm light'],
  'minimalist':            ['minimal', 'simple', 'clean', 'negative space', 'white', 'sparse'],
  'abstract-photography':  ['abstract', 'pattern', 'texture', 'geometric', 'art', 'color', 'shape'],
  'architectural':         ['architecture', 'building', 'structure', 'facade', 'interior', 'staircase'],
  'underwater-photography':['underwater', 'ocean', 'sea', 'coral', 'fish', 'dive', 'reef'],
  'food-photography':      ['food', 'dish', 'meal', 'cooking', 'kitchen', 'ingredient', 'recipe'],
  'travel-photography':    ['travel', 'destination', 'landmark', 'culture', 'monument', 'temple'],
  'fine-art':              ['art', 'illustration', 'digital art', 'painting', 'artistic', 'creative'],
  'documentary':           ['people', 'candid', 'lifestyle', 'real', 'authentic', 'moment'],
};

const CATEGORY_KEYWORDS = {
  nature:       ['nature', 'forest', 'mountain', 'ocean', 'sea', 'lake', 'river', 'beach', 'tree', 'waterfall'],
  urban:        ['city', 'urban', 'building', 'street', 'architecture', 'town', 'skyscraper', 'road'],
  minimal:      ['minimal', 'simple', 'clean', 'white', 'negative space', 'geometric'],
  abstract:     ['abstract', 'pattern', 'texture', 'fractal', 'art', 'digital'],
  cinematic:    ['cinematic', 'dramatic', 'film', 'moody', 'atmospheric', 'noir'],
  illustration: ['illustration', 'digital art', 'painting', 'artwork', 'drawing', 'sketch'],
  flowers:      ['flower', 'bloom', 'blossom', 'petal', 'rose', 'tulip', 'daisy', 'botanical', 'floral'],
  wildlife:     ['animal', 'bird', 'wildlife', 'lion', 'tiger', 'elephant', 'dog', 'cat', 'horse', 'fish', 'butterfly', 'insect'],
  food:         ['food', 'meal', 'dish', 'fruit', 'vegetable', 'cooking', 'kitchen', 'breakfast', 'dessert'],
  sky:          ['sky', 'sunset', 'sunrise', 'cloud', 'star', 'moon', 'galaxy', 'milky way', 'aurora'],
  people:       ['people', 'person', 'portrait', 'face', 'woman', 'man', 'girl', 'boy', 'model', 'child'],
  travel:       ['travel', 'destination', 'landmark', 'temple', 'monument', 'mosque', 'bridge', 'castle'],
  macro:        ['macro', 'close-up', 'dew', 'drop', 'detail', 'micro', 'tiny'],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function tagMatch(tags, keywords) {
  const t = tags.toLowerCase();
  return keywords.some(k => t.includes(k));
}

function mapMoods(tags) {
  const moods = [];
  for (const [mood, kws] of Object.entries(MOOD_KEYWORDS)) {
    if (tagMatch(tags, kws)) moods.push(mood);
  }
  return moods.length ? moods.slice(0, 5) : ['peaceful'];
}

function mapStyles(type, tags) {
  const styles = [];
  for (const [style, kws] of Object.entries(STYLE_KEYWORDS)) {
    if (tagMatch(tags, kws)) styles.push(style);
  }
  if (type === 'illustration' && !styles.includes('fine-art')) styles.unshift('fine-art');
  return styles.length ? styles.slice(0, 4) : ['landscape-photography'];
}

function mapCategory(tags) {
  // Priority order matters — more specific categories first
  const priority = ['macro', 'flowers', 'wildlife', 'food', 'people', 'travel', 'sky', 'urban', 'minimal', 'abstract', 'cinematic', 'illustration', 'nature'];
  for (const cat of priority) {
    if (tagMatch(tags, CATEGORY_KEYWORDS[cat])) return cat;
  }
  return 'nature';
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function aspectRatio(w, h) {
  if (!w || !h) return 1.5;
  const r = w / h;
  return Math.round(r * 100) / 100;
}

function orientation(w, h) {
  if (!w || !h) return 'landscape';
  const r = w / h;
  if (r > 1.1) return 'landscape';
  if (r < 0.9) return 'portrait';
  return 'square';
}

// Build CDN URL — prefer _640 from previewURL (reliable CDN path)
function buildUrls(item) {
  const base640  = item.previewURL.replace('_150.jpg', '_640.jpg');
  const base1280 = item.previewURL.replace('_150.jpg', '_1280.jpg');
  return {
    thumbnailUrl: item.previewURL,   // 150px  — always works
    previewUrl:   base640,           // 640px
    fullUrl:      base1280,          // 1280px
    altText:      item.tags ? item.tags.split(',')[0].trim() : 'Photo by ' + item.user,
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

console.log('Reading Pixabay source data…');
const raw = JSON.parse(readFileSync(INPUT, 'utf8'));
console.log(`  Total records: ${raw.length}`);

// Filter
const filtered = raw.filter(item =>
  !item.isLowQuality &&
  item.isGRated !== false &&
  !item.isAiGenerated
);
console.log(`  After filter (no low-quality, no AI): ${filtered.length}`);

// Sort by views desc, take top 1000
const top1000 = filtered
  .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
  .slice(0, 1000);
console.log(`  Taking top 1000 by views`);

// Build creator map from Pixabay data
const creatorMap = new Map();
for (const item of top1000) {
  if (!creatorMap.has(item.user_id)) {
    creatorMap.set(item.user_id, {
      id:          `cu-${item.user_id}`,
      username:    slugify(item.user),
      displayName: item.user,
      avatar:      item.userImageURL || `https://picsum.photos/seed/${slugify(item.user)}/100/100`,
      bio:         `Photographer on Pixabay`,
      specialties: ['photography'],
      stats: {
        mediaCount:  0,
        totalViews:  0,
        followers:   0,
      },
      featured:  false,
      verified:  false,
      joinedAt:  '2020-01-01T00:00:00Z',
    });
  }
  const c = creatorMap.get(item.user_id);
  c.stats.mediaCount++;
  c.stats.totalViews += (item.views ?? 0);
}

// Map to SENSES Media format
const now = new Date().toISOString();
const pixabayMedia = top1000.map(item => {
  const tags     = item.tags || '';
  const category = mapCategory(tags);
  const urls     = buildUrls(item);
  const title    = tags.split(',')[0].trim() || `Photo by ${item.user}`;
  const slug     = `${slugify(title)}-px${item.id}`;

  return {
    id:          `px-${item.id}`,
    type:        item.type === 'illustration' ? 'illustration' : 'photo',
    division:    'sight',
    title,
    slug,
    description: tags.split(',').slice(0, 6).map(t => t.trim()).join(', '),
    creator:     `cu-${item.user_id}`,
    thumbnail:   urls.thumbnailUrl,
    category,
    tags:        tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 12),
    moods:       mapMoods(tags),
    styles:      mapStyles(item.type, tags),
    colors:      [],
    orientation: orientation(item.imageWidth, item.imageHeight),
    license:     'cc0',
    source:      'pixabay',
    attribution: `${item.user} on Pixabay`,
    stats: {
      views:     item.views     ?? 0,
      likes:     item.likes     ?? 0,
      saves:     item.collections ?? 0,
      downloads: item.downloads ?? 0,
    },
    featured:      (item.views ?? 0) > 500000,
    trending:      (item.views ?? 0) > 300000,
    editorsPick:   (item.views ?? 0) > 1000000,
    createdAt:     now,
    updatedAt:     now,
    seo: {
      title:       `${title} — Free CC0 Photo | Senses`,
      description: `Free CC0 photo: ${tags.split(',').slice(0, 4).join(', ')}. Download and use freely.`,
      keywords:    tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 10),
    },
    data: {
      width:        item.imageWidth  ?? 0,
      height:       item.imageHeight ?? 0,
      aspectRatio:  aspectRatio(item.imageWidth, item.imageHeight),
      format:       'jpg',
      thumbnailUrl: urls.thumbnailUrl,
      previewUrl:   urls.previewUrl,
      fullUrl:      urls.fullUrl,
      altText:      urls.altText,
    },
  };
});

// ─── Merge with existing data ─────────────────────────────────────────────────

console.log('\nReading existing data…');
const existingMedia    = JSON.parse(readFileSync(resolve(SRC, 'media.json'), 'utf8'));
const existingCreators = JSON.parse(readFileSync(resolve(SRC, 'creators.json'), 'utf8'));

// Keep only hearing items from existing media (12 audio items)
const hearingMedia = existingMedia.filter(m => m.division === 'hearing');
console.log(`  Kept ${hearingMedia.length} existing hearing items`);

// Merge media: hearing items first, then Pixabay sight
const mergedMedia = [...hearingMedia, ...pixabayMedia];
console.log(`  Total merged media: ${mergedMedia.length}`);

// Merge creators: keep existing 10, add new Pixabay creators
const pixabayCreators = Array.from(creatorMap.values());
const mergedCreators  = [...existingCreators, ...pixabayCreators];
console.log(`  Total merged creators: ${mergedCreators.length}`);

// ─── Write output ─────────────────────────────────────────────────────────────

console.log('\nWriting output…');
writeFileSync(resolve(SRC, 'media.json'),    JSON.stringify(mergedMedia,    null, 2));
writeFileSync(resolve(SRC, 'creators.json'), JSON.stringify(mergedCreators, null, 2));

console.log(`\n✓ media.json    → ${mergedMedia.length} items`);
console.log(`✓ creators.json → ${mergedCreators.length} creators`);

// Summary stats
const cats = {};
for (const m of pixabayMedia) {
  cats[m.category] = (cats[m.category] ?? 0) + 1;
}
console.log('\nCategory breakdown:');
for (const [c, n] of Object.entries(cats).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${c.padEnd(20)} ${n}`);
}
