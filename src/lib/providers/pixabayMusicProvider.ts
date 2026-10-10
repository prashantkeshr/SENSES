/**
 * pixabayMusicProvider — lazy-loads Pixabay music chunks client-side.
 * Mirrors pixabayProvider pattern: IndexedDB cache + fetch from /data/pb/music/chunks/.
 */

import type { Media, MediaFilters } from '@/types/index';

const DB_NAME    = 'senses-pb-music';
const DB_VERSION = 1;
const STORE      = 'chunks';
const CHUNK_SIZE = 100;
const MAX_CHUNKS = 50;
const TTL_MS     = 7 * 24 * 60 * 60 * 1000;

let _db: IDBDatabase | null = null;
let _cache: Media[] | null  = null;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (_db) return resolve(_db);
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => { _db = req.result; resolve(_db!); };
    req.onerror   = () => reject(req.error);
  });
}

async function getCached(): Promise<Media[] | null> {
  try {
    const db  = await openDB();
    const tx  = db.transaction(STORE, 'readonly');
    const row = await new Promise<any>((res, rej) => {
      const r = tx.objectStore(STORE).get('all');
      r.onsuccess = () => res(r.result);
      r.onerror   = () => rej(r.error);
    });
    if (!row || Date.now() - row.ts > TTL_MS) return null;
    return row.data as Media[];
  } catch { return null; }
}

async function setCache(items: Media[]): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put({ data: items, ts: Date.now() }, 'all');
  } catch { /* non-fatal */ }
}

async function loadAll(): Promise<Media[]> {
  if (_cache) return _cache;
  const cached = await getCached();
  if (cached) { _cache = cached; return cached; }

  const chunks: Media[] = [];
  await Promise.all(
    Array.from({ length: MAX_CHUNKS }, (_, i) =>
      fetch(`/data/pb/music/chunks/${i}.json`)
        .then(r => r.ok ? r.json() : [])
        .then((items: Media[]) => chunks.push(...items))
        .catch(() => {})
    )
  );
  _cache = chunks;
  await setCache(chunks);
  return chunks;
}

function applyFilters(items: Media[], filters?: MediaFilters): Media[] {
  let out = items;
  if (filters?.division && filters.division !== 'hearing') return [];
  if (filters?.category) out = out.filter(m => m.category === filters.category);
  if (filters?.tags?.length) out = out.filter(m => filters.tags!.some(t => m.tags.includes(t)));
  const offset = filters?.offset ?? 0;
  const limit  = filters?.limit  ?? 24;
  return out.slice(offset, offset + limit);
}

export const pixabayMusicProvider = {
  async getMedia(filters?: MediaFilters): Promise<Media[]> {
    const all = await loadAll();
    return applyFilters(all, filters);
  },

  async getMediaById(id: string): Promise<Media | null> {
    const all = await loadAll();
    return all.find(m => m.id === id) ?? null;
  },

  async getMediaBySlug(slug: string): Promise<Media | null> {
    const all = await loadAll();
    return all.find(m => m.slug === slug) ?? null;
  },

  async getFeaturedMedia(limit = 12): Promise<Media[]> {
    const all = await loadAll();
    return all.filter(m => m.trending || m.editorsPick).slice(0, limit);
  },

  async getTrendingMedia(limit = 12): Promise<Media[]> {
    const all = await loadAll();
    return all.filter(m => m.trending).slice(0, limit);
  },

  async searchMedia(query: string, filters?: MediaFilters) {
    const all = await loadAll();
    const q = query.toLowerCase();
    const items = all.filter(m =>
      m.title.toLowerCase().includes(q) ||
      (m as any).creatorName?.toLowerCase().includes(q) ||
      m.tags.some(t => t.includes(q))
    );
    return { items: items.slice(0, filters?.limit ?? 24), total: items.length, query };
  },

  async getTagMedia(tag: string, limit = 24): Promise<Media[]> {
    try {
      const res = await fetch(`/data/pb/music/tags/${tag}.json`);
      if (!res.ok) return [];
      const { items } = await res.json();
      return (items || []).slice(0, limit);
    } catch { return []; }
  },

  async getGenreMedia(genre: string, limit = 24): Promise<Media[]> {
    const all = await loadAll();
    return all.filter(m => m.category === genre).slice(0, limit);
  },
};
