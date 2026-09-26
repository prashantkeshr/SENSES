import { useState, useMemo } from 'react';
import type { Media, Creator } from '@/types/index';
import { formatCount } from '@/lib/utils/formatters';

interface Props {
  media: Media[];
  creators: Creator[];
}

type Chart = 'likes' | 'views' | 'saves' | 'editors';
type Division = 'all' | 'sight' | 'hearing';

const CHART_LABELS: Record<Chart, string> = {
  likes:   'Most Liked',
  views:   'Most Viewed',
  saves:   'Most Saved',
  editors: "Editor's Picks",
};

export function TrendingCharts({ media, creators }: Props) {
  const [chart,    setChart]    = useState<Chart>('likes');
  const [division, setDivision] = useState<Division>('all');

  const creatorMap = useMemo(
    () => Object.fromEntries(creators.map(c => [c.id, c])),
    [creators],
  );

  const ranked = useMemo(() => {
    let items = division === 'all' ? media : media.filter(m => m.division === division);
    if (chart === 'editors') {
      items = items.filter(m => m.editorsPick);
    }
    const sorted = [...items].sort((a, b) => {
      if (chart === 'likes')   return b.stats.likes    - a.stats.likes;
      if (chart === 'views')   return b.stats.views    - a.stats.views;
      if (chart === 'saves')   return b.stats.saves    - a.stats.saves;
      return b.stats.views - a.stats.views;
    });
    return sorted.slice(0, 10);
  }, [media, creators, chart, division]);

  const statVal = (m: Media) => {
    if (chart === 'likes')   return m.stats.likes;
    if (chart === 'views')   return m.stats.views;
    if (chart === 'saves')   return m.stats.saves;
    return m.stats.views;
  };

  const statLabel = () => {
    if (chart === 'likes')   return 'likes';
    if (chart === 'views')   return 'views';
    if (chart === 'saves')   return 'saves';
    return 'views';
  };

  const maxVal = ranked.length > 0 ? statVal(ranked[0]) : 1;

  return (
    <div>
      {/* ── Controls ──────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        {/* Chart tabs */}
        <div className="flex bg-senses-surface rounded-xl p-0.5 border border-senses-border gap-0.5">
          {(Object.keys(CHART_LABELS) as Chart[]).map(c => (
            <button
              key={c}
              onClick={() => setChart(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150
                ${chart === c
                  ? 'bg-senses-surface-2 text-senses-text border border-senses-border'
                  : 'text-senses-text-3 hover:text-senses-text-2'}`}
            >
              {CHART_LABELS[c]}
            </button>
          ))}
        </div>

        {/* Division */}
        <div className="flex bg-senses-surface rounded-xl p-0.5 border border-senses-border gap-0.5">
          {(['all', 'sight', 'hearing'] as Division[]).map(d => (
            <button
              key={d}
              onClick={() => setDivision(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-150
                ${division === d
                  ? d === 'sight'
                    ? 'bg-senses-sight/15 border border-senses-sight/40 text-senses-sight'
                    : d === 'hearing'
                      ? 'bg-senses-hearing/15 border border-senses-hearing/40 text-senses-hearing'
                      : 'bg-senses-surface-2 border border-senses-border text-senses-text'
                  : 'text-senses-text-3 hover:text-senses-text-2'}`}
            >
              {d === 'all' ? 'All' : d}
            </button>
          ))}
        </div>

        <p className="text-senses-text-3 text-xs ml-auto">
          Top {ranked.length} · {statLabel()}
        </p>
      </div>

      {/* ── Chart list ────────────────────────────────────────── */}
      {ranked.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-senses-text-3 text-sm">No items in this filter</p>
        </div>
      ) : (
        <div className="space-y-2">
          {ranked.map((item, i) => {
            const creator = creatorMap[item.creator];
            const href    = `/${item.division}/${item.type}/${item.slug}`;
            const val     = statVal(item);
            const pct     = maxVal > 0 ? (val / maxVal) * 100 : 0;

            return (
              <a
                key={item.id}
                href={href}
                className="group flex items-center gap-4 p-3 rounded-xl hover:bg-senses-surface border border-transparent hover:border-senses-border transition-all duration-200"
              >
                {/* Rank */}
                <span className={`w-6 text-right text-sm flex-shrink-0 font-light
                  ${i === 0 ? 'text-senses-accent' : i < 3 ? 'text-senses-text-2' : 'text-senses-text-3'}`}>
                  {i + 1}
                </span>

                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-senses-surface-2">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Title + creator */}
                <div className="flex-1 min-w-0">
                  <p className="text-senses-text-2 text-sm font-medium truncate group-hover:text-senses-text transition-colors">
                    {item.title}
                  </p>
                  <p className="text-senses-text-3 text-xs truncate">
                    {creator?.displayName ?? item.creator}
                    <span className={`ml-2 text-[10px] uppercase tracking-widest
                      ${item.division === 'sight' ? 'text-senses-sight/70' : 'text-senses-hearing/70'}`}>
                      {item.division}
                    </span>
                  </p>
                </div>

                {/* Bar + count */}
                <div className="flex items-center gap-2 flex-shrink-0 w-28 hidden sm:flex">
                  <div className="flex-1 h-1 rounded-full bg-senses-surface-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-senses-accent transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-senses-text-3 text-xs w-12 text-right tabular-nums">
                    {formatCount(val)}
                  </span>
                </div>

                {/* Mobile count */}
                <span className="text-senses-text-3 text-xs flex-shrink-0 sm:hidden tabular-nums">
                  {formatCount(val)}
                </span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
