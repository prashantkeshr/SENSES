import type { Media, LocalUserState } from '@/types/index';

function scoreItem(m: Media, signals: Record<string, number>): number {
  let score = 0;
  m.tags.forEach(t   => { score += (signals[t]        ?? 0) * 2;   });
  m.moods.forEach(mood => { score += (signals[mood]   ?? 0) * 1.5; });
  m.styles.forEach(s => { score += (signals[s]        ?? 0) * 1;   });
  score += (signals[m.category] ?? 0) * 3;
  if (m.trending)    score += 2;
  if (m.featured)    score += 1;
  if (m.editorsPick) score += 1.5;
  return score;
}

export function getRecommendedMedia(
  allMedia:  Media[],
  state:     LocalUserState,
  limit = 12,
): Media[] {
  const { interestSignals: signals, likedMediaIds, hiddenMediaIds } = state;
  const excluded = new Set([...likedMediaIds, ...(hiddenMediaIds ?? [])]);

  if (Object.keys(signals).length === 0) {
    return allMedia.filter(m => m.trending || m.featured).slice(0, limit);
  }

  return allMedia
    .filter(m => !excluded.has(m.id))
    .map(m => ({ m, score: scoreItem(m, signals) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(x => x.m);
}

export function getSimilarMedia(
  target:   Media,
  allMedia: Media[],
  limit = 6,
): Media[] {
  const pseudo: Record<string, number> = {};
  target.tags.forEach(t   => { pseudo[t]             = 3; });
  target.moods.forEach(m  => { pseudo[m]             = 2; });
  target.styles.forEach(s => { pseudo[s]             = 1; });
  pseudo[target.category] = 4;

  return allMedia
    .filter(m => m.id !== target.id && m.division === target.division)
    .map(m => ({ m, score: scoreItem(m, pseudo) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(x => x.m);
}

export function getRecentlyViewed(
  allMedia:          Media[],
  recentlyViewedIds: string[],
  limit = 10,
): Media[] {
  const map = Object.fromEntries(allMedia.map(m => [m.id, m]));
  return recentlyViewedIds
    .slice(0, limit)
    .map(id => map[id])
    .filter(Boolean) as Media[];
}

export function getTopInterests(
  signals: Record<string, number>,
  limit = 12,
): { label: string; count: number }[] {
  return Object.entries(signals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}
