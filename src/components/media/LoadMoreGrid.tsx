import { useState, useCallback } from 'react';
import { MediaCard } from './MediaCard';
import type { Media } from '@/types/index';

interface LoadMoreGridProps {
  initialItems:  Media[];
  chunkBasePath: string; // e.g. "/data/pb/music/chunks/"
  startChunk?:   number; // which chunk index to fetch first (default 0)
  totalCount?:   number; // total items available (for UI label)
  division:      'sight' | 'hearing';
  layout?:       'masonry' | 'grid';
}

function toMedia(raw: Record<string, unknown>): Media {
  return raw as unknown as Media;
}

export function LoadMoreGrid({
  initialItems,
  chunkBasePath,
  startChunk = 0,
  totalCount,
  division,
  layout = 'grid',
}: LoadMoreGridProps) {
  const [items, setItems]         = useState<Media[]>(initialItems);
  const [chunkIndex, setChunkIndex] = useState(startChunk);
  const [loading, setLoading]     = useState(false);
  const [exhausted, setExhausted] = useState(false);

  const seenIds = new Set(items.map(m => m.id));

  const loadMore = useCallback(async () => {
    if (loading || exhausted) return;
    setLoading(true);
    try {
      const url = `${chunkBasePath}${chunkIndex}.json`;
      const res = await fetch(url);
      if (!res.ok) { setExhausted(true); setLoading(false); return; }
      const chunk: Record<string, unknown>[] = await res.json();
      const fresh = chunk
        .map(toMedia)
        .filter(m => !seenIds.has(m.id));
      if (fresh.length === 0) {
        setExhausted(true);
      } else {
        setItems(prev => [...prev, ...fresh]);
        setChunkIndex(prev => prev + 1);
      }
    } catch {
      setExhausted(true);
    }
    setLoading(false);
  }, [chunkBasePath, chunkIndex, loading, exhausted, seenIds]);

  const gridClass = layout === 'grid'
    ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'
    : 'masonry-grid';

  return (
    <div>
      <div className={gridClass}>
        {items.map(item => (
          <MediaCard key={item.id} media={item} layout={layout} />
        ))}
      </div>

      {/* Load More / footer */}
      <div className="mt-10 flex flex-col items-center gap-2">
        {totalCount && (
          <p className="text-senses-text-3 text-sm">
            Showing {items.length.toLocaleString()} of {totalCount.toLocaleString()}
          </p>
        )}
        {!exhausted ? (
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-8 py-3 rounded-xl bg-senses-surface border border-senses-border
                       text-senses-text-2 text-sm hover:border-senses-border-2 hover:text-senses-text
                       transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading…' : 'Load More'}
          </button>
        ) : (
          <p className="text-senses-text-3 text-xs py-2">All items shown</p>
        )}
      </div>
    </div>
  );
}
