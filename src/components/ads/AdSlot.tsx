interface AdData {
  id:       string;
  headline: string;
  body:     string;
  cta:      string;
  href:     string;
  image?:   string;
  brand:    string;
}

// Mock ads for V1 — replace with API call in production
const ADS: AdData[] = [
  {
    id:       'ad-1',
    headline: 'Create without limits',
    body:     'Professional editing tools for visual creators. 30-day free trial.',
    cta:      'Try free',
    href:     '#',
    brand:    'CreatorPro',
    image:    'https://picsum.photos/seed/ad1/600/400',
  },
  {
    id:       'ad-2',
    headline: 'Royalty-free music for your projects',
    body:     'Thousands of tracks licensed for video, podcasts, and content.',
    cta:      'Browse tracks',
    href:     '#',
    brand:    'AudioLib',
    image:    'https://picsum.photos/seed/ad2/600/400',
  },
  {
    id:       'ad-3',
    headline: 'Your photos, beautifully printed',
    body:     'Museum-quality prints shipped worldwide. From wall art to albums.',
    cta:      'Order now',
    href:     '#',
    brand:    'PrintHaus',
    image:    'https://picsum.photos/seed/ad3/600/400',
  },
];

function getAd(index = 0): AdData {
  return ADS[index % ADS.length];
}

interface NativeAdProps {
  index?: number;
}

// ── Native card (fits inside a media grid) ───────────────────────────────────
export function NativeAdCard({ index = 0 }: NativeAdProps) {
  const ad = getAd(index);
  return (
    <a
      href={ad.href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="block rounded-2xl bg-senses-surface border border-senses-border overflow-hidden group hover:border-senses-border-2 transition-all"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-senses-surface-2">
        {ad.image && (
          <img src={ad.image} alt="" className="w-full h-full object-cover opacity-50 group-hover:opacity-60 transition-opacity" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-senses-bg/80 to-transparent" />
        <span className="absolute top-2 right-2 text-[9px] uppercase tracking-widest text-senses-text-3 bg-senses-bg/70 px-1.5 py-0.5 rounded">
          Sponsored
        </span>
      </div>

      {/* Content */}
      <div className="p-3">
        <p className="text-senses-text-3 text-[10px] uppercase tracking-wider mb-1">{ad.brand}</p>
        <p className="text-senses-text text-sm font-medium leading-snug mb-1 line-clamp-2">{ad.headline}</p>
        <p className="text-senses-text-3 text-xs leading-relaxed line-clamp-2 mb-3">{ad.body}</p>
        <span className="inline-flex items-center gap-1 text-xs text-senses-accent font-medium">
          {ad.cta} →
        </span>
      </div>
    </a>
  );
}

// ── Banner (horizontal, full-width) ─────────────────────────────────────────
export function BannerAd({ index = 0 }: NativeAdProps) {
  const ad = getAd(index);
  return (
    <div className="border-t border-b border-senses-border py-3 px-4 md:px-8">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <span className="text-[9px] uppercase tracking-widest text-senses-text-3 flex-shrink-0">Ad</span>
          <div className="min-w-0">
            <span className="text-senses-text-3 text-[10px] uppercase tracking-wider">{ad.brand} · </span>
            <span className="text-senses-text-2 text-sm">{ad.headline}</span>
            <span className="text-senses-text-3 text-xs ml-2 hidden sm:inline">{ad.body}</span>
          </div>
        </div>
        <a
          href={ad.href}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs border border-senses-border bg-senses-surface text-senses-text-2 hover:border-senses-border-2 hover:text-senses-text transition-all"
        >
          {ad.cta}
        </a>
      </div>
    </div>
  );
}
