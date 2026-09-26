import type { Media } from '@/types/index';
import { patchLocalState, getLocalState } from './localState';

export interface DownloadRecord {
  mediaId:    string;
  license:    string;
  format?:    string;
  downloadedAt: string;
}

const KEY = 'senses:downloads';

function loadRecords(): DownloadRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveRecords(records: DownloadRecord[]): void {
  try { localStorage.setItem(KEY, JSON.stringify(records)); } catch { /* noop */ }
}

export function recordDownload(mediaId: string, license: string, format?: string): void {
  const records = loadRecords();
  records.unshift({ mediaId, license, format, downloadedAt: new Date().toISOString() });
  saveRecords(records.slice(0, 200));

  // Also update the localState downloadHistory array
  const state = getLocalState();
  const history = [mediaId, ...state.downloadHistory.filter(id => id !== mediaId)].slice(0, 100);
  patchLocalState({ downloadHistory: history });
}

export function getDownloadRecords(): DownloadRecord[] {
  return loadRecords();
}

export function getDownloadHistory(allMedia: Media[]): Media[] {
  const map = Object.fromEntries(allMedia.map(m => [m.id, m]));
  const records = loadRecords();
  const seen = new Set<string>();
  return records
    .map(r => map[r.mediaId])
    .filter(m => {
      if (!m || seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
}

export function getDownloadCount(): number {
  return getLocalState().downloadHistory.length;
}
