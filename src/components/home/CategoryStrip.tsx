import type { Category } from '@/types/index';

interface CategoryStripProps {
  categories: Category[];
  activeSlug?: string;
}

export default function CategoryStrip({ categories, activeSlug }: CategoryStripProps) {
  const all = [
    { id: 'all', slug: '', label: 'All', division: 'all' as const, featured: true },
    ...categories,
  ];

  return (
    <div className="relative">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 px-4 md:px-8">
        {all.map(cat => {
          const isActive = activeSlug === cat.slug || (!activeSlug && cat.slug === '');
          const divColor = (cat as Category).division === 'hearing' ? 'border-senses-hearing/30 text-senses-hearing'
                         : (cat as Category).division === 'sight' ? 'border-senses-sight/30 text-senses-sight'
                         : '';
          return (
            <a
              key={cat.id}
              href={cat.slug ? `/explore?category=${cat.slug}` : '/explore'}
              className={`flex-shrink-0 px-4 py-2 rounded-full border text-sm transition-all duration-[var(--duration-base)]
                ${isActive
                  ? 'bg-senses-accent text-senses-bg border-senses-accent'
                  : `bg-senses-surface border-senses-border text-senses-text-2 hover:border-senses-border-2 hover:text-senses-text ${divColor}`
                }`}
            >
              {cat.label}
            </a>
          );
        })}
      </div>
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-senses-bg to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-senses-bg to-transparent" />
    </div>
  );
}
