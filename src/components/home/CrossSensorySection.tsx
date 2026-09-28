import type { Collection } from '@/types/index';

interface CrossSensorySectionProps {
  collections: Collection[];
}

export default function CrossSensorySection({ collections }: CrossSensorySectionProps) {
  const featured = collections.filter(c => c.crossSensory && c.featured).slice(0, 3);
  if (featured.length === 0) return null;

  return (
    <section className="py-10 md:py-14 px-4 md:px-8">
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] tracking-widest text-senses-text-3 uppercase">Cross-Sensory</span>
          </div>
          <h2 className="text-xl md:text-2xl font-light tracking-tight text-senses-text">
            Sight × Hearing
          </h2>
          <p className="text-senses-text-3 text-sm mt-0.5">
            Curated experiences where visual and audio media connect.
          </p>
        </div>
        <a href="/collections" className="text-sm text-senses-text-3 hover:text-senses-text transition-colors duration-[var(--duration-base)] flex-shrink-0 ml-4">
          All collections →
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {featured.map(col => (
          <a
            key={col.id}
            href={`/collection/${col.slug}`}
            className="group relative rounded-2xl overflow-hidden bg-senses-surface border border-senses-border
                       hover:border-senses-border-2 transition-all duration-[var(--duration-slow)]
                       hover:-translate-y-0.5 hover:shadow-[0_16px_48px_rgba(0,0,0,0.6)]"
          >
            {/* Cover image */}
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={col.coverImage}
                alt={col.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-5">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="w-1 h-1 rounded-full bg-senses-sight" />
                <span className="text-[10px] text-senses-sight tracking-widest uppercase">Sight</span>
                <span className="text-senses-text-3 text-[10px]">+</span>
                <span className="w-1 h-1 rounded-full bg-senses-hearing" />
                <span className="text-[10px] text-senses-hearing tracking-widest uppercase">Hearing</span>
              </div>
              <h3 className="text-white font-light text-lg leading-tight mb-1">{col.title}</h3>
              <p className="text-white/60 text-xs leading-snug line-clamp-2">{col.description}</p>
              <p className="text-white/40 text-[11px] mt-2">Curated by Senses</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
