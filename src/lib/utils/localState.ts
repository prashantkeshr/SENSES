import type { LocalUserState } from '@/types/index';

const KEY = 'senses:user-state';

const defaultState = (): LocalUserState => ({
  likedMediaIds:      [],
  savedMediaIds:      [],
  followedCreatorIds: [],
  hiddenMediaIds:     [],
  hiddenCreatorIds:   [],
  searchHistory:      [],
  recentlyViewedIds:  [],
  downloadHistory:    [],
  interestSignals:    {},
  theme:              'dark',
  createdAt:          new Date().toISOString(),
  updatedAt:          new Date().toISOString(),
});

export function getLocalState(): LocalUserState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch {
    return defaultState();
  }
}

export function setLocalState(state: LocalUserState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...state, updatedAt: new Date().toISOString() }));
  } catch { /* storage full or unavailable */ }
}

export function patchLocalState(patch: Partial<LocalUserState>): LocalUserState {
  const current = getLocalState();
  const next = { ...current, ...patch };
  setLocalState(next);
  return next;
}

// ─── Convenience helpers ──────────────────────────────────────────────────────

export function toggleLike(mediaId: string): boolean {
  const state = getLocalState();
  const liked = state.likedMediaIds.includes(mediaId);
  patchLocalState({
    likedMediaIds: liked
      ? state.likedMediaIds.filter(id => id !== mediaId)
      : [...state.likedMediaIds, mediaId],
  });
  return !liked;
}

export function toggleSave(mediaId: string): boolean {
  const state = getLocalState();
  const saved = state.savedMediaIds.includes(mediaId);
  patchLocalState({
    savedMediaIds: saved
      ? state.savedMediaIds.filter(id => id !== mediaId)
      : [...state.savedMediaIds, mediaId],
  });
  return !saved;
}

export function toggleFollow(creatorId: string): boolean {
  const state = getLocalState();
  const following = state.followedCreatorIds.includes(creatorId);
  patchLocalState({
    followedCreatorIds: following
      ? state.followedCreatorIds.filter(id => id !== creatorId)
      : [...state.followedCreatorIds, creatorId],
  });
  return !following;
}

export function recordView(mediaId: string, tags: string[], moods: string[], category: string): void {
  const state = getLocalState();
  const recent = [mediaId, ...state.recentlyViewedIds.filter(id => id !== mediaId)].slice(0, 50);
  const signals = { ...state.interestSignals };
  tags.forEach(t  => { signals[t]        = (signals[t]        ?? 0) + 1; });
  moods.forEach(m => { signals[m]        = (signals[m]        ?? 0) + 1; });
                        signals[category] = (signals[category] ?? 0) + 2;
  patchLocalState({ recentlyViewedIds: recent, interestSignals: signals });
}

export function addSearchHistory(query: string): void {
  const state = getLocalState();
  const history = [query, ...state.searchHistory.filter(q => q !== query)].slice(0, 20);
  patchLocalState({ searchHistory: history });
}

export function clearLocalData(): void {
  try { localStorage.removeItem(KEY); } catch { /* noop */ }
}

export function exportLocalData(): string {
  return JSON.stringify(getLocalState(), null, 2);
}
