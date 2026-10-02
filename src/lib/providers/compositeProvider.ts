/**
 * compositeProvider.ts
 * Merges the curated JSON provider (30 hand-crafted items: hearing content,
 * editorial picks, collections) with the Pixabay fetch provider (86k images).
 *
 * Strategy:
 *  - Curated data is always first and authoritative for hearing/collections/creators
 *  - Pixabay data fills sight content (photos, illustrations, vectors)
 *  - Search checks curated first, then falls through to Pixabay tag search
 */

import type { SensesDataProvider, Media, MediaFilters, SearchResult } from '@/types/index';
import { jsonProvider }     from './jsonProvider';
import { pixabayProvider }  from './pixabayProvider';

const isServer = typeof window === 'undefined';

async function getPbMedia(filters?: MediaFilters): Promise<Media[]> {
  // Pixabay provider only runs client-side (uses fetch + IndexedDB).
  // On the server (SSG build), return empty — pages use SSG-imported featured data.
  if (isServer) return [];
  return (pixabayProvider.getMedia!(filters));
}

export const compositeProvider: SensesDataProvider = {

  // ── Media ──────────────────────────────────────────────────────────────────

  async getMedia(filters) {
    const curated = await jsonProvider.getMedia(filters);
    if (isServer) return curated;

    // Only fetch Pixabay items for sight division (or when no division filter)
    if (filters?.division === 'hearing') return curated;

    const pbFilters: MediaFilters = {
      ...filters,
      division: 'sight',
      limit: Math.max((filters?.limit ?? 24) - curated.length, 0),
      offset: Math.max((filters?.offset ?? 0) - curated.length, 0),
    };
    if (pbFilters.limit === 0) return curated;
    const pb = await getPbMedia(pbFilters);
    return [...curated, ...pb];
  },

  async getMediaById(id) {
    // Always check curated store first — curated items also use px-* IDs.
    const curated = await jsonProvider.getMediaById(id);
    if (curated) return curated;
    if (isServer) return null;
    return pixabayProvider.getMediaById!(id);
  },

  async getMediaBySlug(slug) {
    const curated = await jsonProvider.getMediaBySlug(slug);
    if (curated) return curated;
    if (isServer) return null;
    return pixabayProvider.getMediaBySlug!(slug);
  },

  async getFeaturedMedia(limit = 12) {
    const curated = await jsonProvider.getFeaturedMedia(limit);
    if (isServer || curated.length >= limit) return curated.slice(0, limit);
    const pb = await pixabayProvider.getFeaturedMedia!(limit - curated.length);
    return [...curated, ...pb].slice(0, limit);
  },

  async getTrendingMedia(limit = 12) {
    const curated = await jsonProvider.getTrendingMedia(limit);
    if (isServer || curated.length >= limit) return curated.slice(0, limit);
    const pb = await pixabayProvider.getTrendingMedia!(limit - curated.length);
    return [...curated, ...pb].slice(0, limit);
  },

  async getLatestMedia(limit = 12) {
    const curated = await jsonProvider.getLatestMedia(limit);
    if (isServer || curated.length >= limit) return curated.slice(0, limit);
    const pb = await pixabayProvider.getLatestMedia!(limit - curated.length);
    return [...curated, ...pb].slice(0, limit);
  },

  async getEditorsPicks(limit = 8) {
    const curated = await jsonProvider.getEditorsPicks(limit);
    if (isServer || curated.length >= limit) return curated.slice(0, limit);
    const pb = await pixabayProvider.getEditorsPicks!(limit - curated.length);
    return [...curated, ...pb].slice(0, limit);
  },

  // ── Search ─────────────────────────────────────────────────────────────────

  async searchMedia(query, filters) {
    const t0 = Date.now();
    const curatedResult = await jsonProvider.searchMedia(query, filters);
    if (isServer) return curatedResult;

    const pbResult = await pixabayProvider.searchMedia!(query, filters);
    const combined = [...curatedResult.items, ...pbResult.items];
    const limited  = filters?.limit ? combined.slice(0, filters.limit) : combined;
    return {
      items: limited,
      total: curatedResult.total + pbResult.total,
      query,
      filters,
      took: Date.now() - t0,
    };
  },

  async getRelatedMedia(mediaId, limit = 8) {
    // Check curated store first — curated items use px-* IDs too.
    const curatedSource = await jsonProvider.getMediaById(mediaId);
    if (!curatedSource) {
      // True Pixabay item
      if (isServer) return [];
      return pixabayProvider.getRelatedMedia!(mediaId, limit);
    }
    const curated = await jsonProvider.getRelatedMedia(mediaId, limit);
    if (curated.length >= limit) return curated;
    if (isServer) return curated;
    const pb = await pixabayProvider.searchMedia!(curatedSource.tags[0] ?? '', { limit: limit - curated.length });
    return [...curated, ...pb.items].slice(0, limit);
  },

  async getSimilarMood(mediaId, limit = 8) {
    const curated = await jsonProvider.getSimilarMood(mediaId, limit);
    if (isServer || curated.length >= limit) return curated;
    const pb = await pixabayProvider.getSimilarMood!(mediaId, limit - curated.length);
    return [...curated, ...pb].slice(0, limit);
  },

  // ── Creators (curated only) ────────────────────────────────────────────────

  async getCreators(limit = 20)        { return jsonProvider.getCreators(limit); },
  async getCreatorById(id)             { return jsonProvider.getCreatorById(id); },
  async getCreatorByUsername(username) { return jsonProvider.getCreatorByUsername(username); },
  async getCreatorMedia(creatorId, filters) {
    if (creatorId.startsWith('px-user-')) return [];
    return jsonProvider.getCreatorMedia(creatorId, filters);
  },

  // ── Collections / Categories (curated only) ───────────────────────────────

  async getCollections(limit = 20)  { return jsonProvider.getCollections(limit); },
  async getCollectionById(id)       { return jsonProvider.getCollectionById(id); },
  async getCollectionBySlug(slug)   { return jsonProvider.getCollectionBySlug(slug); },

  async getCategories(division)     { return jsonProvider.getCategories(division); },
  async getCategoryMedia(cat, filters) {
    const curated = await jsonProvider.getCategoryMedia(cat, filters);
    if (isServer) return curated;
    const pb = await pixabayProvider.getCategoryMedia!(cat, { ...filters, limit: Math.max((filters?.limit ?? 24) - curated.length, 0) });
    return [...curated, ...pb];
  },

  // ── Recommendations ────────────────────────────────────────────────────────

  async getRecommendations(signals, limit = 12) {
    const curated = await jsonProvider.getRecommendations(signals, limit);
    if (isServer || curated.length >= limit) return curated;
    const pb = await pixabayProvider.getRecommendations!(signals, limit - curated.length);
    return [...curated, ...pb].slice(0, limit);
  },

  // ── Cross-sensory (curated only, Pixabay has no audio) ───────────────────

  async getCrossSensory(mediaId) {
    const curatedSource = await jsonProvider.getMediaById(mediaId);
    if (!curatedSource) return { sight: [], hearing: [] };
    return jsonProvider.getCrossSensory(mediaId);
  },
};
