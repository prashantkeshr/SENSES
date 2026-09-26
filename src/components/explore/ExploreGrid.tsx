import { useState, useMemo } from 'react';
import type { Media, Creator } from '@/types/index';
import { MediaCard }      from '@/components/media/MediaCard';
import { mediaTypeLabel } from '@/lib/utils/formatters';

type Division = 'all' | 'sight' | 'hearing';
type Sort     = 'trending' | 'latest' | 'popular';

interface Props {
  media:            Media[];
  creators:         Creator[];
  initialDivision?: Division;
  initialMood?:     string;
}

const PAGE = 12;

export function ExploreGrid({ media, creators, initialDivision = 'all', initialMood = 'all' }: Props) {
  const [division,    setDivision]   = useState<Division>(initialDivision);
  const [typeFilter,  setTypeFilter] = useState('all');
  const [moodFilter,  setMoodFilter] = useState(initialMood);
  const [sort,        setSort]       = useState<Sort>('trending');
  const [page,        setPage]       = useState(1);
  const [showMoods,   setShowMoods]  = useState(initialMood !== 'all');

  const creatorMap = useMemo(
    () => Object.fromEntries(creators.map(c => [c.id, c])),
    [creators],
  );

  const availableTypes = useMemo(() => {
    const types = new Set(
      media
        .filter(m => division === 'all' || m.division === division)
        .map(m => m.type),
    );
    return ['all', ...Array.from(types)];
  }, [media, division]);

  const availableMoods = useMemo(() => {
    const moodCount: Record<string, number> = {};
    media
      .filter(m => division === 'all' || m.division === division)
      .forEach(m => m.moods.forEach(mood => { moodCount[mood] = (moodCount[mood] ?? 0) + 1; }));
    return Object.entries(moodCount).sort((a, b) => b[1] - a[1]).map(([mood]) => mood);
  }, [media, division]);

  const filtered = useMemo(() => {
    let items = media;
    if (division !== 'all')   items = items.filter(m => m.division === division);
    if (typeFilter !== 'all') items = items.filter(m => m.type === typeFilter);
    if (moodFilter !== 'all') items = items.filter(m => m.moods.includes(moodFilter));

    return [...items].sort((a, b) => {
      if (sort === 'trending') {
        const diff = (b.trending ? 1 : 0) - (a.trending ? 1 : 0);
        return diff !== 0 ? diff : b.stats.views - a.stats.views;
      }
      if (sort === 'latest')  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return b.stats.likes - a.stats.likes;
    });
  }, [media, division, typeFilter, sort]);

  const visible = filtered.slice(0, page * PAGE);
  const hasMore = visible.length < filtered.length;

  const handleDivision = (d: Division) => {
    setDivision(d);
    setTypeFilter('all');
    setMoodFilter('all');
    setPage(1);
  };

  const divisionAccent = (d: Division) => {
    if (d === 'sight')   return 'bg-senses-sight/15 border-senses-sight/40 text-senses-sight';
    if (d === 'hearing') return 'bg-senses-hearing/15 border-senses-hearing/40 text-senses-hearing';
    return 'bg-senses-surface-2 border-senses-border-2 text-senses-text';
  };

  const typeAccent = division === 'hearing'
    ? 'bg-senses-hearing/15 border-senses-hearing/40 text-senses-hearing'
    : 'bg-senses-sight/15 border-senses-sight/40 text-senses-sight';

  return (
    <div>
      {/* ─── Sticky filter bar ──────────────────────────────────────── */}
      <div className="sticky top-[var(--nav-height)] z-30 bg-senses-bg/95 backdrop-blur-md border-b border-senses-border">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-2.5 flex flex-wrap items-center gap-2.5">

          {/* Division toggle */}
          <div className="flex bg-senses-surface rounded-lg p-0.5 border border-senses-border flex-shrink-0">
            {(['all', 'sight', 'hearing'] as Division[]).map(d => (
              <button
                key={d}
                onClick={() => handleDivision(d)}
                className={`px-3 py-1.5 rounded-md text-[11px] font-medium uppercase tracking-wider transition-all duration-150
                  ${division === d ? divisionAccent(d) : 'text-senses-text-3 hover:text-senses-text'}`}
              >
                {d === 'all' ? 'All' : d}
              </button>
            ))}
          </div>

          {/* Separator */}
          <div className="h-5 w-px bg-senses-border flex-shrink-0 hidden sm:block" />

          {/* Type filter chips */}
          <div className="flex gap-1.5 flex-wrap">
            {availableTypes.map(type => (
              <button
                key={type}
                onClick={() => { setTypeFilter(type); setPage(1); }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all duration-150
                  ${typeFilter === type
                    ? typeAccent
                    : 'bg-transparent border-transparent text-senses-text-3 hover:text-senses-text'}`}
              >
                {type === 'all' ? 'All types' : mediaTypeLabel(type)}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="ml-auto flex items-center gap-0.5 flex-shrink-0">
            {(['trending', 'latest', 'popular'] as Sort[]).map(s => (
              <button
                key={s}
                onClick={() => { setSort(s); setPage(1); }}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] capitalize transition-all duration-150
                  ${sort === s
                    ? 'bg-senses-surface-2 text-senses-text'
                    : 'text-senses-text-3 hover:text-senses-text'}`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Mood toggle */}
          <button
            onClick={() => { setShowMoods(v => !v); if (showMoods) { setMoodFilter('all'); setPage(1); } }}
            className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] border transition-all duration-150
              ${moodFilter !== 'all'
                ? 'bg-senses-accent/15 border-senses-accent/40 text-senses-accent'
                : showMoods
                  ? 'bg-senses-surface-2 border-senses-border text-senses-text'
                  : 'border-transparent text-senses-text-3 hover:text-senses-text'}`}
          >
            Mood
            {moodFilter !== 'all' && <span className="capitalize">{moodFilter}</span>}
            <span className={`transition-transform duration-150 ${showMoods ? 'rotate-180' : ''}`}>▾</span>
          </button>
        </div>

        {/* Mood chips row */}
        {showMoods && (
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 pb-2.5 flex flex-wrap gap-1.5">
            <button
              onClick={() => { setMoodFilter('all'); setPage(1); }}
              className={`px-2.5 py-1 rounded-full text-[11px] border transition-all duration-150
                ${moodFilter === 'all'
                  ? 'bg-senses-surface-2 border-senses-border text-senses-text'
                  : 'border-transparent text-senses-text-3 hover:text-senses-text'}`}
            >
              All moods
            </button>
            {availableMoods.map(mood => (
              <button
                key={mood}
                onClick={() => { setMoodFilter(mood === moodFilter ? 'all' : mood); setPage(1); }}
                className={`px-2.5 py-1 rounded-full text-[11px] border capitalize transition-all duration-150
                  ${moodFilter === mood
                    ? 'bg-senses-accent/15 border-senses-accent/40 text-senses-accent'
                    : 'border-transparent text-senses-text-3 hover:text-senses-text'}`}
              >
                {mood}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ─── Count bar ──────────────────────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 pt-5 pb-3">
        <p className="text-senses-text-3 text-xs">
          {filtered.length === media.length
            ? `${filtered.length} items`
            : `${filtered.length} of ${media.length} items`}
        </p>
      </div>

      {/* ─── Grid ───────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-24 text-center">
          <p className="text-senses-text-3 text-lg mb-1">Nothing here yet</p>
          <p className="text-senses-text-3 text-sm">Try a different filter combination</p>
        </div>
      ) : (
        <div className="max-w-[1440px] mx-auto px-4 md:px-8">
          <div className="masonry-grid">
            {visible.map(item => (
              <MediaCard
                key={item.id}
                media={item}
                creator={creatorMap[item.creator]}
              />
            ))}
          </div>

          {hasMore && (
            <div className="text-center py-10">
              <button
                onClick={() => setPage(p => p + 1)}
                className="px-6 py-2.5 rounded-xl bg-senses-surface border border-senses-border text-senses-text-2 hover:border-senses-border-2 hover:text-senses-text text-sm transition-all duration-200"
              >
                Show more · {filtered.length - visible.length} remaining
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
