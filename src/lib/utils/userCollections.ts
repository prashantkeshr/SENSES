export interface UserCollection {
  id:        string;
  name:      string;
  mediaIds:  string[];
  createdAt: string;
}

const KEY = 'senses:user-collections';

function load(): UserCollection[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(cols: UserCollection[]) {
  try { localStorage.setItem(KEY, JSON.stringify(cols)); } catch { /* noop */ }
}

export function getUserCollections(): UserCollection[] {
  return load();
}

export function createUserCollection(name: string): UserCollection {
  const col: UserCollection = {
    id:        `uc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name:      name.trim(),
    mediaIds:  [],
    createdAt: new Date().toISOString(),
  };
  save([...load(), col]);
  return col;
}

export function deleteUserCollection(id: string): void {
  save(load().filter(c => c.id !== id));
}

export function addToUserCollection(collectionId: string, mediaId: string): void {
  const cols = load();
  const col  = cols.find(c => c.id === collectionId);
  if (!col || col.mediaIds.includes(mediaId)) return;
  col.mediaIds = [mediaId, ...col.mediaIds];
  save(cols);
}

export function removeFromUserCollection(collectionId: string, mediaId: string): void {
  const cols = load();
  const col  = cols.find(c => c.id === collectionId);
  if (!col) return;
  col.mediaIds = col.mediaIds.filter(id => id !== mediaId);
  save(cols);
}

export function isInUserCollection(collectionId: string, mediaId: string): boolean {
  return load().find(c => c.id === collectionId)?.mediaIds.includes(mediaId) ?? false;
}

export function getCollectionsContaining(mediaId: string): UserCollection[] {
  return load().filter(c => c.mediaIds.includes(mediaId));
}

export function renameUserCollection(id: string, name: string): void {
  const cols = load();
  const col  = cols.find(c => c.id === id);
  if (col) { col.name = name.trim(); save(cols); }
}
