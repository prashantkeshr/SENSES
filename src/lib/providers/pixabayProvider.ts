/**
 * pixabayProvider.ts
 * Lazy-loads Pixabay image chunks from /data/pb/chunks/{n}.json.
 * Memory-caches loaded chunks during the session.
 * Uses IndexedDB for 7-day cross-session caching on all devices.
 */

import type { SensesDataProvider, Media, MediaFilters, SearchResult } from '@/types/index';

const BASE       = '/data/pb';
const CHUNK_SIZE = 200;
const IDB_DB     = 'senses-pb';
const IDB_STORE  = 'chunks';
const IDB_TTL    = 7 * 24 * 60 * 60 * 1000; // 7 days

// ── In-memory cache ───────────────────────────────────────────────────────────
const chunkCache = new Map<number, Media[]>();
let   metaCache:  { total: number; chunkCount: number; byType: Record<string, number> } | null = null;

// ── IndexedDB helpers ─────────────────────────────────────────────────────────
function openIDB(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  return new Promise(res => {
    try {
      const req = indexedDB.open(IDB_DB, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(IDB_STORE)) {
          req.result.createObjectStore(IDB_STORE, { keyPath: 'key' });
        }
      };
      req.onsuccess = () => res(req.result);
      req.onerror   = () => res(null);
    } catch { res(null); }
  });
}

async function idbGet(key: string): Promise<Media[] | null> {
  const db = await openIDB();
  if (!db) return null;
  return new Promise(res => {
    try {
      const tx  = db.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).get(key);
      req.onsuccess = () => {
        const row = req.result;
        if (!row || Date.now() - row.ts > IDB_TTL) { res(null); return; }
        res(row.data as Media[]);
      };
      req.onerror = () => res(null);
    } catch { res(null); }
  });
}

async function idbSet(key: string, data: Media[]): Promise<void> {
  const db = await openIDB();
  if (!db) return;
  try {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put({ key, ts: Date.now(), data });
  } catch { /* ignore write failures */ }
}

// ── Fetch helpers ─────────────────────────────────────────────────────────────
async function fetchMeta() {
  if (metaCache) return metaCache;
  try {
    const r = await fetch(`${BASE}/meta.json`);
    metaCache = await r.json();
  } catch { metaCache = { total: 0, chunkCount: 0, byType: {} }; }
  return metaCache!;
}

async function fetchChunk(n: number): Promise<Media[]> {
  if (chunkCache.has(n)) return chunkCache.get(n)!;

  const idbKey = `chunk-${n}`;
  const cached = await idbGet(idbKey);
  if (cached) { chunkCache.set(n, cached); return cached; }

  try {
    const r    = await fetch(`${BASE}/chunks/${n}.json`);
    const data = (await r.json()) as Media[];
    chunkCache.set(n, data);
    await idbSet(idbKey, data);
    return data;
  } catch { return []; }
}

async function fetchTagData(slug: string): Promise<Media[]> {
  try {
    const r    = await fetch(`${BASE}/tags/${slug}.json`);
    const body = await r.json();
    return (body.items || []).map(itemToMedia);
  } catch { return []; }
}

// ── Thin tag-item → full Media stub ──────────────────────────────────────────
function itemToMedia(item: Record<string, unknown>): Media {
  return {
    id:          item.id as string,
    pixabayId:   undefined,
    type:        item.type as Media['type'],
    division:    'sight',
    slug:        item.slug as string,
    title:       item.title as string,
    description: '',
    creator:     '',
    creatorName: '',
    creatorAvatar: '',
    thumbnail:   item.thumbnail as string,
    category:    'nature',
    tags:        (item.tags as string[]) ?? [],
    moods:       [],
    styles:      [],
    colors:      [],
    orientation: (item.orientation as Media['orientation']) ?? 'landscape',
    license:     'pixabay',
    attribution: '',
    source:      'pixabay',
    quality:     'standard',
    featured:    false,
    trending:    (item.views as number) > 50000,
    editorsPick: (item.views as number) > 100000,
    stats:       { views: item.views as number ?? 0, downloads: 0, likes: 0, saves: 0, comments: 0 },
    createdAt:   '',
    updatedAt:   '',
    seo:         { title: item.title as string, description: '', keywords: item.tags as string[] ?? [] },
    data:        {
      width: item.thumbnailWidth as number ?? 640,
      height: item.thumbnailHeight as number ?? 480,
      aspectRatio: '4:3',
      format: 'jpg',
      thumbnailUrl: item.thumbnail as string,
      previewUrl:   item.previewUrl as string ?? item.thumbnail as string,
      fullUrl:      item.previewUrl as string ?? item.thumbnail as string,
      altText:      item.title as string,
      colors:       [],
    },
  } as unknown as Media;
}

// ── Apply filters ──────────────────────────────────────────────────────────────
function applyFilters(items: Media[], filters?: MediaFilters): Media[] {
  if (!filters) return items;
  return items.filter(m => {
    if (filters.type) {
      const types = Array.isArray(filters.type) ? filters.type : [filters.type];
      if (!types.includes(m.type)) return false;
    }
    if (filters.category  && m.category    !== filters.category)  return false;
    if (filters.mood      && !m.moods.includes(filters.mood))      return false;
    if (filters.style     && !m.styles.includes(filters.style))    return false;
    if (filters.orientation && m.orientation !== filters.orientation) return false;
    if (filters.license   && m.license      !== filters.license)   return false;
    if (filters.featured  !== undefined && m.featured  !== filters.featured)  return false;
    if (filters.trending  !== undefined && m.trending  !== filters.trending)  return false;
    return true;
  });
}

// ── Provider ──────────────────────────────────────────────────────────────────
export const pixabayProvider: Partial<SensesDataProvider> = {

  async getMedia(filters) {
    const { chunkCount } = await fetchMeta();
    const limit  = filters?.limit  ?? CHUNK_SIZE;
    const offset = filters?.offset ?? 0;

    const startChunk = Math.floor(offset / CHUNK_SIZE);
    const endChunk   = Math.min(Math.ceil((offset + limit) / CHUNK_SIZE), chunkCount);

    const chunks = await Promise.all(
      Array.from({ length: endChunk - startChunk }, (_, i) => fetchChunk(startChunk + i))
    );
    const flat = chunks.flat();

    let items = applyFilters(flat, filters);
    // Slice to requested window
    const localOffset = offset - startChunk * CHUNK_SIZE;
    items = items.slice(localOffset, localOffset + limit);
    return items;
  },

  async getMediaById(id) {
    const n = Math.floor(parseInt(id.replace('px-', ''), 10) / CHUNK_SIZE);
    const chunk = await fetchChunk(Math.max(0, n));
    return chunk.find(m => m.id === id) ?? null;
  },

  async getMediaBySlug(slug) {
    return pixabayProvider.getMediaById!(slug);
  },

  async getFeaturedMedia(limit = 12) {
    const chunk0 = await fetchChunk(0);
    return chunk0.filter(m => m.featured || m.editorsPick).slice(0, limit);
  },

  async getTrendingMedia(limit = 12) {
    const chunk0 = await fetchChunk(0);
    return chunk0.filter(m => m.trending).slice(0, limit);
  },

  async getLatestMedia(limit = 12) {
    const chunk0 = await fetchChunk(0);
    return chunk0.slice(0, limit);
  },

  async getEditorsPicks(limit = 8) {
    const chunk0 = await fetchChunk(0);
    return chunk0.filter(m => m.editorsPick).slice(0, limit);
  },

  async searchMedia(query, filters) {
    const t0 = Date.now();
    const slug = query.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    let items = await fetchTagData(slug);
    if (!items.length && query.trim()) {
      // Fall back to filtering chunk 0
      const chunk0 = await fetchChunk(0);
      items = chunk0.filter(m => m.tags.some(t => t.includes(query.toLowerCase())));
    }
    items = applyFilters(items, filters);
    if (filters?.limit) items = items.slice(0, filters.limit);
    return { items, total: items.length, query, filters, took: Date.now() - t0 };
  },

  async getRelatedMedia(mediaId, limit = 8) {
    const source = await pixabayProvider.getMediaById!(mediaId);
    if (!source) return [];
    const chunk0 = await fetchChunk(0);
    return chunk0
      .filter(m => m.id !== mediaId && m.tags.some(t => source.tags.includes(t)))
      .slice(0, limit);
  },

  async getCreators() { return []; },
  async getCreatorById() { return null; },
  async getCreatorByUsername() { return null; },
  async getCreatorMedia() { return []; },
  async getCollections() { return []; },
  async getCollectionById() { return null; },
  async getCollectionBySlug() { return null; },
  async getCategories() { return []; },
  async getCategoryMedia(cat, filters) {
    const chunk0 = await fetchChunk(0);
    return applyFilters(chunk0.filter(m => m.category === cat), filters);
  },
  async getRecommendations(signals, limit = 12) {
    const chunk0 = await fetchChunk(0);
    return chunk0
      .map(m => {
        let score = 0;
        m.tags.forEach(t => { score += signals[t] ?? 0; });
        if (signals[m.category]) score += signals[m.category] * 2;
        return { m, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ m }) => m);
  },
  async getSimilarMood(mediaId, limit = 8) {
    const source = await pixabayProvider.getMediaById!(mediaId);
    if (!source) return [];
    const chunk0 = await fetchChunk(0);
    return chunk0.filter(m => m.id !== mediaId).slice(0, limit);
  },
  async getCrossSensory() { return { sight: [], hearing: [] }; },
};
