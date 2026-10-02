// ─── Media Types ────────────────────────────────────────────────────────────

export type MediaType =
  | 'photo'
  | 'video'
  | 'illustration'
  | 'vector'
  | 'gif'
  | '3d'
  | 'music'
  | 'sound'
  | 'ambient'
  | 'loop';

export type MediaDivision = 'sight' | 'hearing';

export type LicenseType =
  | 'cc0'
  | 'cc-by'
  | 'cc-by-sa'
  | 'editorial'
  | 'commercial'
  | 'senses-original'
  | 'placeholder'
  | 'pixabay';

export type Orientation = 'landscape' | 'portrait' | 'square';

export type FeatureStatus = 'available' | 'local' | 'preview' | 'coming-soon';

// ─── License ────────────────────────────────────────────────────────────────

export interface License {
  type: LicenseType;
  label: string;
  commercialUse: boolean;
  attributionRequired: boolean;
  redistributionAllowed: boolean;
  url?: string;
}

// ─── Creator ─────────────────────────────────────────────────────────────────

export interface Creator {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  specialties: string[];
  location?: string;
  website?: string;
  stats: {
    mediaCount: number;
    totalViews: number;
    followers: number;
  };
  featured: boolean;
  verified: boolean;
  joinedAt: string;
}

// ─── Universal Media Schema ───────────────────────────────────────────────────

export interface MediaStats {
  views: number;
  likes: number;
  saves: number;
  downloads: number;
}

export interface MediaSEO {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
}

export interface ImageData {
  width: number;
  height: number;
  aspectRatio: string;
  format: string;
  thumbnailUrl: string;
  previewUrl: string;
  fullUrl: string;
  altText: string;
  colors?: string[];
}

export interface VideoData {
  duration: number;
  fps: number;
  resolution: string;
  format: string;
  thumbnailUrl: string;
  previewUrl?: string;
  streamUrl: string;
  aspectRatio: string;
  hasCaption: boolean;
}

export interface AudioData {
  duration: number;
  bitrate: number;
  sampleRate: number;
  channels: number;
  format: string;
  streamUrl: string;
  artworkUrl: string;
  waveformData?: number[];
  bpm?: number;
  key?: string;
}

export type MediaTypeData = ImageData | VideoData | AudioData;

export interface Media {
  id: string;
  type: MediaType;
  division: MediaDivision;
  title: string;
  slug: string;
  description: string;
  creator: string;
  thumbnail: string;
  category: string;
  subcategory?: string;
  tags: string[];
  moods: string[];
  styles: string[];
  colors: string[];
  orientation: Orientation;
  license: LicenseType;
  source?: string;
  attribution?: string;
  stats: MediaStats;
  featured: boolean;
  trending: boolean;
  editorsPick: boolean;
  createdAt: string;
  updatedAt: string;
  seo: MediaSEO;
  data: MediaTypeData;
  crossSensory?: {
    relatedSightIds?: string[];
    relatedHearingIds?: string[];
  };
}

// ─── Category ─────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  slug: string;
  label: string;
  description: string;
  division: MediaDivision | 'all';
  parentId?: string;
  icon?: string;
  mediaCount: number;
  featured: boolean;
  coverImage: string;
  moods: string[];
}

// ─── Collection ──────────────────────────────────────────────────────────────

export interface Collection {
  id: string;
  slug: string;
  title: string;
  description: string;
  curatedBy: string;
  coverImage: string;
  mediaIds: string[];
  tags: string[];
  featured: boolean;
  crossSensory: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Advertisement ────────────────────────────────────────────────────────────

export type AdFormat = 'card' | 'banner' | 'inline' | 'sponsored-media' | 'sponsored-collection';

export interface Advertisement {
  id: string;
  type: 'advertisement' | 'sponsored' | 'affiliate';
  format: AdFormat;
  position: 'feed' | 'sidebar' | 'top' | 'bottom' | 'discover';
  priority: number;
  active: boolean;
  image: string;
  title: string;
  description: string;
  link: string;
  label: string;
  campaign?: string;
}

// ─── User / Local State ───────────────────────────────────────────────────────

export interface LocalUserState {
  likedMediaIds: string[];
  savedMediaIds: string[];
  followedCreatorIds: string[];
  hiddenMediaIds: string[];
  hiddenCreatorIds: string[];
  searchHistory: string[];
  recentlyViewedIds: string[];
  downloadHistory: string[];
  interestSignals: Record<string, number>;
  theme: 'dark' | 'light' | 'system';
  createdAt: string;
  updatedAt: string;
}

// ─── Search ───────────────────────────────────────────────────────────────────

export interface MediaFilters {
  type?: MediaType | MediaType[];
  division?: MediaDivision;
  category?: string;
  mood?: string;
  style?: string;
  orientation?: Orientation;
  license?: LicenseType;
  creatorId?: string;
  featured?: boolean;
  trending?: boolean;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  items: Media[];
  total: number;
  query: string;
  filters?: MediaFilters;
  took: number;
}

// ─── Provider Interface ───────────────────────────────────────────────────────

export interface SensesDataProvider {
  getMedia(filters?: MediaFilters): Promise<Media[]>;
  getMediaById(id: string): Promise<Media | null>;
  getMediaBySlug(slug: string): Promise<Media | null>;
  getFeaturedMedia(limit?: number): Promise<Media[]>;
  getTrendingMedia(limit?: number): Promise<Media[]>;
  getLatestMedia(limit?: number): Promise<Media[]>;
  getEditorsPicks(limit?: number): Promise<Media[]>;
  searchMedia(query: string, filters?: MediaFilters): Promise<SearchResult>;
  getRelatedMedia(mediaId: string, limit?: number): Promise<Media[]>;
  getSimilarMood(mediaId: string, limit?: number): Promise<Media[]>;
  getCreators(limit?: number): Promise<Creator[]>;
  getCreatorById(id: string): Promise<Creator | null>;
  getCreatorByUsername(username: string): Promise<Creator | null>;
  getCreatorMedia(creatorId: string, filters?: MediaFilters): Promise<Media[]>;
  getCollections(limit?: number): Promise<Collection[]>;
  getCollectionById(id: string): Promise<Collection | null>;
  getCollectionBySlug(slug: string): Promise<Collection | null>;
  getCategories(division?: MediaDivision): Promise<Category[]>;
  getCategoryMedia(categorySlug: string, filters?: MediaFilters): Promise<Media[]>;
  getRecommendations(signals: Record<string, number>, limit?: number): Promise<Media[]>;
  getCrossSensory(mediaId: string): Promise<{ sight: Media[]; hearing: Media[] }>;
}
