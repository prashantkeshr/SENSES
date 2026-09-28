import { useState, useEffect, useCallback, useRef } from 'react';
import type { Media, Creator } from '@/types/index';
import { MediaCard }   from '@/components/media/MediaCard';
import { SkeletonCard } from '@/components/ui/SkeletonCard';

interface Props {
  media:    Media[];
  creators: Creator[];
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dailySeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function interleavedShuffle<T extends { category?: string }>(arr: T[], seed: number): T[] {
  const rng = mulberry32(seed);
  const groups = new Map<string, T[]>();
  arr.forEach(item => {
    const cat = item.category ?? 'other';
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat)!.push(item);
  });
  const shuffled = new Map<string, T[]>();
  groups.forEach((items, cat) => {
    const a = [...items];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    shuffled.set(cat, a);
  });
  const result: T[] = [];
  const keys = Array.from(shuffled.keys());
  const idxMap = new Map(keys.map(k => [k, 0]));
  let added = true;
  while (added) {
    added = false;
    for (const key of keys) {
      const idx = idxMap.get(key)!;
      const grp = shuffled.get(key)!;
      if (idx < grp.length) { result.push(grp[idx]); idxMap.set(key, idx + 1); added = true; }
    }
  }
  return result;
}

function randomShuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function ShuffleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
    </svg>
  );
}

export function GalleryWall({ media, creators }: Props) {
  const [items,   setItems]   = useState<Media[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const wallRef = useRef<HTMLDivElement>(null);

  const creatorMap = Object.fromEntries(creators.map(c => [c.id, c]));

  const reshuffle = useCallback(() => {
    setIsShuffling(true);
    setTimeout(() => {
      setItems(randomShuffle(media));
      setIsShuffling(false);
    }, 180);
  }, [media]);

  useEffect(() => {
    // Random shuffle on every open (like Reels/Shorts), interleaved by category
    const seed = Date.now() ^ (Math.random() * 0xffffffff);
    setItems(interleavedShuffle(media, seed));
    setMounted(true);
  }, [media]);

  // Section reveal with IntersectionObserver
  useEffect(() => {
    if (!mounted || !wallRef.current) return;
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.05 }
    );
    wallRef.current.querySelectorAll('.section-reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="gallery-wall px-0.5 pt-0.5">
        {Array.from({ length: 20 }).map((_, i) => (
          <SkeletonCard
            key={i}
            layout="masonry"
            aspectRatio={['3/4','4/3','1/1','5/6','4/5'][i % 5]}
          />
        ))}
      </div>
    );
  }

  return (
    <div ref={wallRef}>
      {/* Controls bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-senses-border sticky top-[var(--nav-height)] bg-senses-bg/95 backdrop-blur-md z-20">
        <div className="flex items-center gap-4">
          <span className="text-senses-text-3 text-xs">
            8.8 million+ high quality photos, videos &amp; music
          </span>
        </div>
        <button
          onClick={reshuffle}
          disabled={isShuffling}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-senses-surface border border-senses-border
                     text-senses-text-2 hover:text-senses-text hover:border-senses-accent/50 hover:bg-senses-surface-2
                     text-sm transition-all duration-200 disabled:opacity-40"
        >
          <ShuffleIcon />
          Surprise me
        </button>
      </div>

      {/* Wall grid */}
      <div
        className={`gallery-wall px-0.5 pt-0.5 transition-opacity duration-200 ${isShuffling ? 'opacity-0' : 'opacity-100'}`}
      >
        {items.map((item, idx) => (
          <div
            key={`${item.id}-${idx}`}
            className="section-reveal"
            style={{ transitionDelay: `${Math.min(idx * 20, 300)}ms` }}
          >
            <MediaCard
              media={item}
              creator={creatorMap[item.creator]}
              layout="masonry"
            />
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="flex items-center justify-center h-60 text-senses-text-3">
          No media found
        </div>
      )}
    </div>
  );
}
