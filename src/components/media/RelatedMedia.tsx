import { useState, useEffect } from 'react';
import { MediaCard } from './MediaCard';
import type { Media } from '@/types/index';

interface RelatedMediaProps {
  currentId:  string;
  division:   'sight' | 'hearing';
  category?:  string;
  /** Base path for chunks: e.g. "/data/pb/music/chunks/" */
  chunkPath:  string;
  /** Total number of chunks to pick from */
  chunkCount: number;
  label?:     string;
}

export function RelatedMedia({
  currentId,
  division,
  category,
  chunkPath,
  chunkCount,
  label = 'More Like This',
}: RelatedMediaProps) {
  const [items, setItems]   = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Pick a random chunk to sample from (avoid always loading chunk 0)
    const idx = Math.floor(Math.random() * chunkCount);
    fetch(`${chunkPath}${idx}.json`)
      .then(r => r.json())
      .then((chunk: Media[]) => {
        const filtered = chunk
          .filter(m => m.id !== currentId)
          // Prefer same category but don't require it
          .sort((a, b) => {
            const aMatch = a.category === category ? 0 : 1;
            const bMatch = b.category === category ? 0 : 1;
            return aMatch - bMatch || (b.stats?.likes ?? 0) - (a.stats?.likes ?? 0);
          })
          .slice(0, 12);
        setItems(filtered);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentId, chunkPath, chunkCount, category]);

  if (loading) {
    return (
      <div className="py-12 flex items-center justify-center gap-2 text-senses-text-3 text-sm">
        <span className="animate-pulse">Loading recommendations…</span>
      </div>
    );
  }

  if (items.length === 0) return null;

  const isGrid = division === 'sight' && items[0]?.type === 'video';

  return (
    <section className="mt-12 pt-10 border-t border-senses-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-senses-text text-base font-medium">{label}</h2>
        <span className="text-senses-text-3 text-xs">{items.length} items</span>
      </div>
      <div className={
        isGrid
          ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'
          : division === 'hearing'
          ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3'
          : 'masonry-grid'
      }>
        {items.map(item => (
          <MediaCard
            key={item.id}
            media={item}
            layout={isGrid || division === 'hearing' ? 'grid' : 'masonry'}
          />
        ))}
      </div>
    </section>
  );
}
