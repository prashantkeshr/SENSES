interface Props {
  layout?: 'masonry' | 'grid';
  aspectRatio?: string;
}

export function SkeletonCard({ layout = 'masonry', aspectRatio = '4/3' }: Props) {
  return (
    <div className="animate-pulse">
      <div
        className={`w-full rounded-xl bg-senses-surface-2 ${layout === 'grid' ? 'aspect-square' : ''}`}
        style={layout === 'masonry' ? { aspectRatio } : undefined}
      />
      <div className="mt-2 space-y-1.5 px-0.5">
        <div className="h-3 bg-senses-surface-2 rounded-md w-3/4" />
        <div className="h-2.5 bg-senses-surface-2 rounded-md w-1/2" />
      </div>
    </div>
  );
}

export function SkeletonRow({ count = 4, layout = 'grid' as 'masonry' | 'grid' }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} layout={layout} />
      ))}
    </>
  );
}
