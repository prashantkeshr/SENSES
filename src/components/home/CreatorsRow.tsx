import type { Creator } from '@/types/index';
import { formatCount } from '@lib/utils/formatters';

interface CreatorsRowProps {
  creators: Creator[];
}

export default function CreatorsRow({ creators }: CreatorsRowProps) {
  if (creators.length === 0) return null;

  return (
    <section className="py-10 md:py-14">
      <div className="flex items-end justify-between mb-6 px-4 md:px-8">
        <div>
          <h2 className="text-xl md:text-2xl font-light tracking-tight text-senses-text">
            Rising Creators
          </h2>
          <p className="text-senses-text-3 text-sm mt-0.5">The artists behind the work</p>
        </div>
        <a href="/creators" className="text-sm text-senses-text-3 hover:text-senses-text transition-colors duration-[var(--duration-base)] flex-shrink-0 ml-4">
          View all →
        </a>
      </div>

      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 px-4 md:px-8">
        {creators.map(creator => (
          <a
            key={creator.id}
            href={`/creator/${creator.username}`}
            className="flex-shrink-0 w-[180px] md:w-[200px] group"
          >
            <div className="rounded-2xl overflow-hidden bg-senses-surface border border-senses-border
                            hover:border-senses-border-2 transition-all duration-[var(--duration-slow)]
                            hover:-translate-y-0.5 p-5 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full overflow-hidden mb-3 ring-2 ring-senses-border group-hover:ring-senses-border-2 transition-all duration-[var(--duration-slow)]">
                <img
                  src={creator.avatar}
                  alt={creator.displayName}
                  loading="lazy"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${creator.username}/80/80`;
                  }}
                />
              </div>
              <p className="text-senses-text text-sm font-medium leading-tight mb-0.5 line-clamp-1">
                {creator.displayName}
              </p>
              {creator.verified && (
                <div className="flex items-center gap-1 mb-2">
                  <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 text-senses-accent">
                    <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zm3.5 5.5L6.75 10.25 4.5 8l-.75.75 3 3 5.5-5.5-.75-.75z"/>
                  </svg>
                  <span className="text-senses-text-3 text-[10px]">Verified</span>
                </div>
              )}
              <p className="text-senses-text-3 text-[11px] line-clamp-2 leading-snug mb-3">
                {creator.bio}
              </p>
              <div className="flex gap-3 text-[11px] text-senses-text-3 w-full justify-center border-t border-senses-border pt-3">
                <div className="text-center">
                  <div className="text-senses-text text-sm font-light">{creator.stats.mediaCount}</div>
                  <div className="text-[10px]">works</div>
                </div>
                <div className="text-center">
                  <div className="text-senses-text text-sm font-light">{formatCount(creator.stats.followers)}</div>
                  <div className="text-[10px]">followers</div>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
