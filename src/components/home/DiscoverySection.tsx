import type { Media, Creator } from '@/types/index';
import { MediaCard } from '@components/media/MediaCard';

interface DiscoverySectionProps {
  title:       string;
  subtitle?:   string;
  media:       Media[];
  creators?:   Creator[];
  viewAllHref?: string;
  layout?:     'masonry' | 'grid' | 'row';
  accent?:     'sight' | 'hearing' | 'none';
}

const creatorMap = (creators: Creator[]) =>
  Object.fromEntries(creators.map(c => [c.id, c]));

export default function DiscoverySection({
  title, subtitle, media, creators = [], viewAllHref, layout = 'masonry', accent = 'none',
}: DiscoverySectionProps) {
  if (media.length === 0) return null;
  const cMap = creatorMap(creators);

  const accentClass = accent === 'sight' ? 'text-senses-sight'
                    : accent === 'hearing' ? 'text-senses-hearing'
                    : 'text-senses-accent';

  return (
    <section className="py-10 md:py-14">
      {/* Section header */}
      <div className="flex items-end justify-between mb-6 px-4 md:px-8">
        <div>
          <h2 className={`text-xl md:text-2xl font-light tracking-tight ${accentClass}`}>
            {title}
          </h2>
          {subtitle && (
            <p className="text-senses-text-3 text-sm mt-0.5">{subtitle}</p>
          )}
        </div>
        {viewAllHref && (
          <a
            href={viewAllHref}
            className="text-sm text-senses-text-3 hover:text-senses-text transition-colors duration-[var(--duration-base)] flex-shrink-0 ml-4"
          >
            View all →
          </a>
        )}
      </div>

      {/* Grid */}
      {layout === 'masonry' ? (
        <div className="masonry-grid px-4 md:px-8">
          {media.map(m => (
            <MediaCard
              key={m.id}
              media={m}
              creator={cMap[m.creator]}
              layout="masonry"
            />
          ))}
        </div>
      ) : layout === 'row' ? (
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 px-4 md:px-8">
          {media.map(m => (
            <div key={m.id} className="flex-shrink-0 w-[260px] md:w-[300px]">
              <MediaCard media={m} creator={cMap[m.creator]} layout="grid" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 px-4 md:px-8">
          {media.map(m => (
            <MediaCard
              key={m.id}
              media={m}
              creator={cMap[m.creator]}
              layout="grid"
            />
          ))}
        </div>
      )}
    </section>
  );
}
