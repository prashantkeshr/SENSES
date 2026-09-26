import { useState, useEffect, useMemo } from 'react';
import type { Media, Creator } from '@/types/index';
import { getLocalState } from '@/lib/utils/localState';
import { getRecommendedMedia } from '@/lib/utils/recommendations';
import { MediaCard } from '@/components/media/MediaCard';

interface Props {
  media:    Media[];
  creators: Creator[];
}

export function ForYouSection({ media, creators }: Props) {
  const [items,    setItems]    = useState<Media[]>([]);
  const [hasData,  setHasData]  = useState(false);
  const [mounted,  setMounted]  = useState(false);

  const creatorMap = useMemo(() => Object.fromEntries(creators.map(c => [c.id, c])), [creators]);

  useEffect(() => {
    const state  = getLocalState();
    const recs   = getRecommendedMedia(media, state, 12);
    const signals = state.interestSignals;
    setItems(recs);
    setHasData(Object.keys(signals).length > 0);
    setMounted(true);
  }, [media]);

  if (!mounted || items.length === 0) return null;

  const sightItems   = items.filter(m => m.division === 'sight');
  const hearingItems = items.filter(m => m.division === 'hearing');

  return (
    <section className="px-4 md:px-8 py-10 border-t border-senses-border">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-senses-accent block" />
            <h2 className="text-senses-text text-base font-medium">
              {hasData ? 'Picked for You' : 'Start Discovering'}
            </h2>
          </div>
          <p className="text-senses-text-3 text-sm">
            {hasData
              ? 'Based on what you\'ve explored and loved'
              : 'Trending and featured picks to get you started'}
          </p>
        </div>
        <a
          href="/explore"
          className="text-senses-text-3 hover:text-senses-text text-xs transition-colors flex-shrink-0 mt-1"
        >
          Explore all →
        </a>
      </div>

      {/* SIGHT items */}
      {sightItems.length > 0 && (
        <div className="mb-6">
          {hearingItems.length > 0 && (
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-senses-sight text-[10px] uppercase tracking-widest font-medium">Sight</span>
            </div>
          )}
          <div className="masonry-grid">
            {sightItems.map(m => (
              <MediaCard key={m.id} media={m} creator={creatorMap[m.creator]} />
            ))}
          </div>
        </div>
      )}

      {/* HEARING items */}
      {hearingItems.length > 0 && (
        <div>
          {sightItems.length > 0 && (
            <div className="flex items-center gap-1.5 mb-3 mt-4">
              <span className="text-senses-hearing text-[10px] uppercase tracking-widest font-medium">Hearing</span>
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {hearingItems.map(m => (
              <MediaCard key={m.id} media={m} creator={creatorMap[m.creator]} layout="grid" />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
