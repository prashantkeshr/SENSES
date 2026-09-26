import type {
  SensesDataProvider, Media, Creator, Collection, Category,
  MediaFilters, SearchResult,
} from '@/types/index';
import mediaData from '@data/media.json';
import creatorsData from '@data/creators.json';
import categoriesData from '@data/categories.json';
import collectionsData from '@data/collections.json';
import Fuse from 'fuse.js';

const allMedia     = mediaData     as Media[];
const allCreators  = creatorsData  as Creator[];
const allCategories = categoriesData as Category[];
const allCollections = collectionsData as Collection[];

function applyFilters(items: Media[], filters?: MediaFilters): Media[] {
  if (!filters) return items;
  return items.filter(m => {
    if (filters.type) {
      const types = Array.isArray(filters.type) ? filters.type : [filters.type];
      if (!types.includes(m.type)) return false;
    }
    if (filters.division && m.division !== filters.division) return false;
    if (filters.category && m.category !== filters.category) return false;
    if (filters.mood && !m.moods.includes(filters.mood)) return false;
    if (filters.style && !m.styles.includes(filters.style)) return false;
    if (filters.orientation && m.orientation !== filters.orientation) return false;
    if (filters.license && m.license !== filters.license) return false;
    if (filters.creatorId && m.creator !== filters.creatorId) return false;
    if (filters.featured !== undefined && m.featured !== filters.featured) return false;
    if (filters.trending !== undefined && m.trending !== filters.trending) return false;
    return true;
  });
}

const fuseInstance = new Fuse(allMedia, {
  keys: [
    { name: 'title',        weight: 3 },
    { name: 'description',  weight: 2 },
    { name: 'tags',         weight: 2 },
    { name: 'moods',        weight: 1 },
    { name: 'styles',       weight: 1 },
    { name: 'category',     weight: 1.5 },
  ],
  threshold: 0.35,
  includeScore: true,
});

export const jsonProvider: SensesDataProvider = {
  async getMedia(filters) {
    let items = applyFilters(allMedia, filters);
    if (filters?.limit)  items = items.slice(filters.offset ?? 0, (filters.offset ?? 0) + filters.limit);
    return items;
  },

  async getMediaById(id) {
    return allMedia.find(m => m.id === id) ?? null;
  },

  async getMediaBySlug(slug) {
    return allMedia.find(m => m.slug === slug) ?? null;
  },

  async getFeaturedMedia(limit = 12) {
    return allMedia.filter(m => m.featured).slice(0, limit);
  },

  async getTrendingMedia(limit = 12) {
    return allMedia.filter(m => m.trending).slice(0, limit);
  },

  async getLatestMedia(limit = 12) {
    return [...allMedia]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  },

  async getEditorsPicks(limit = 8) {
    return allMedia.filter(m => m.editorsPick).slice(0, limit);
  },

  async searchMedia(query, filters) {
    const start = Date.now();
    let results: Media[];
    if (!query.trim()) {
      results = applyFilters(allMedia, filters);
    } else {
      const fuseResults = fuseInstance.search(query);
      results = fuseResults.map(r => r.item);
      results = applyFilters(results, filters);
    }
    const limited = filters?.limit ? results.slice(0, filters.limit) : results;
    return { items: limited, total: results.length, query, filters, took: Date.now() - start };
  },

  async getRelatedMedia(mediaId, limit = 8) {
    const source = allMedia.find(m => m.id === mediaId);
    if (!source) return [];
    return allMedia
      .filter(m => m.id !== mediaId)
      .map(m => {
        let score = 0;
        if (m.category === source.category) score += 4;
        score += m.tags.filter(t => source.tags.includes(t)).length * 2;
        score += m.moods.filter(t => source.moods.includes(t)).length * 2;
        score += m.styles.filter(t => source.styles.includes(t)).length;
        return { m, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ m }) => m);
  },

  async getSimilarMood(mediaId, limit = 8) {
    const source = allMedia.find(m => m.id === mediaId);
    if (!source) return [];
    return allMedia
      .filter(m => m.id !== mediaId)
      .filter(m => m.moods.some(mood => source.moods.includes(mood)))
      .slice(0, limit);
  },

  async getCreators(limit = 20) {
    return allCreators.slice(0, limit);
  },

  async getCreatorById(id) {
    return allCreators.find(c => c.id === id) ?? null;
  },

  async getCreatorByUsername(username) {
    return allCreators.find(c => c.username === username) ?? null;
  },

  async getCreatorMedia(creatorId, filters) {
    return applyFilters(allMedia.filter(m => m.creator === creatorId), filters);
  },

  async getCollections(limit = 20) {
    return allCollections.slice(0, limit);
  },

  async getCollectionById(id) {
    return allCollections.find(c => c.id === id) ?? null;
  },

  async getCollectionBySlug(slug) {
    return allCollections.find(c => c.slug === slug) ?? null;
  },

  async getCategories(division) {
    if (!division) return allCategories;
    return allCategories.filter(c => c.division === division || c.division === 'all');
  },

  async getCategoryMedia(categorySlug, filters) {
    return applyFilters(allMedia.filter(m => m.category === categorySlug), filters);
  },

  async getRecommendations(signals, limit = 12) {
    return allMedia
      .map(m => {
        let score = 0;
        m.tags.forEach(tag => { score += signals[tag] ?? 0; });
        m.moods.forEach(mood => { score += signals[mood] ?? 0; });
        m.styles.forEach(style => { score += signals[style] ?? 0; });
        if (signals[m.category]) score += signals[m.category] * 2;
        return { m, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ m }) => m);
  },

  async getCrossSensory(mediaId) {
    const source = allMedia.find(m => m.id === mediaId);
    if (!source?.crossSensory) return { sight: [], hearing: [] };
    const sightIds   = source.crossSensory.relatedSightIds   ?? [];
    const hearingIds = source.crossSensory.relatedHearingIds ?? [];
    const sight   = sightIds.map(id => allMedia.find(m => m.id === id)).filter(Boolean) as Media[];
    const hearing = hearingIds.map(id => allMedia.find(m => m.id === id)).filter(Boolean) as Media[];
    return { sight, hearing };
  },
};
