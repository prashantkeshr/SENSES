import { useState, useEffect, useRef, useMemo } from 'react';
import type { Media, Creator } from '@/types/index';
import { getLocalState } from '@/lib/utils/localState';
import { getRecentlyViewed } from '@/lib/utils/recommendations';

interface Props {
  media:    Media[];
  creators: Creator[];
}

export function RecentlyViewed({ media, creators }: Props) {
  const [items,   setItems]   = useState<Media[]>([]);
  const [mounted, setMounted] = useState(false);
  const scrollRef             = useRef<HTMLDivElement>(null);

  const creatorMap = useMemo(() => Object.fromEntries(creators.map(c => [c.id, c])), [creators]);

  useEffect(() => {
    const state = getLocalState();
    setItems(getRecentlyViewed(media, state.recentlyViewedIds, 10));
    setMounted(true);
  }, [media]);

  if (!mounted || items.length === 0) return null;

  return (
    <section className="px-4 md:px-8 py-6 border-t border-senses-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-senses-text-3 text-xs uppercase tracking-widest font-medium">
          Recently Viewed
        </h2>
        <button
          onClick={() => scrollRef.current?.scrollBy({ left: 280, behavior: 'smooth' })}
          className="text-senses-text-3 hover:text-senses-text text-xs transition-colors"
          aria-label="Scroll right"
        >
          →
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map(m => {
          const href    = m.division === 'hearing'
            ? `/hearing/${m.type}/${m.slug}`
            : `/sight/${m.type}/${m.slug}`;
          const accent  = m.division === 'hearing' ? '#8FAEC0' : '#C8B89A';

          return (
            <a
              key={m.id}
              href={href}
              className="flex-shrink-0 group"
              style={{ width: '140px' }}
            >
              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-senses-surface-2 mb-2">
                <img
                  src={m.thumbnail}
                  alt={m.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Division dot */}
                <span
                  className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: accent }}
                />
              </div>
              <p className="text-senses-text-2 text-xs leading-tight line-clamp-2 group-hover:text-senses-text transition-colors">
                {m.title}
              </p>
              {creatorMap[m.creator] && (
                <p className="text-senses-text-3 text-[10px] mt-0.5 truncate">
                  {creatorMap[m.creator].displayName}
                </p>
              )}
            </a>
          );
        })}
      </div>
    </section>
  );
}
