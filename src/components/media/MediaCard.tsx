import { useState, useCallback } from 'react';
import type { Media, Creator } from '@/types/index';
import { TypeBadge } from '@components/ui/Badge';
import { formatCount, formatDuration } from '@lib/utils/formatters';
import { toggleLike, toggleSave, getLocalState } from '@lib/utils/localState';

interface MediaCardProps {
  media:   Media;
  creator?: Creator;
  layout?: 'masonry' | 'grid' | 'list';
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    </svg>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M8 5v14l11-7z"/>
    </svg>
  );
}

function WaveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <path strokeLinecap="round" d="M9 9v6M12 6v12M15 9v6M6 10.5v3M18 10.5v3"/>
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3 h-3">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}

export function MediaCard({ media, creator, layout = 'masonry' }: MediaCardProps) {
  const state = getLocalState();
  const [liked, setLiked] = useState(state.likedMediaIds.includes(media.id));
  const [saved, setSaved] = useState(state.savedMediaIds.includes(media.id));
  const [imgError, setImgError] = useState(false);

  const handleLike = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked(toggleLike(media.id));
  }, [media.id]);

  const handleSave = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved(toggleSave(media.id));
  }, [media.id]);

  const isAudio  = media.division === 'hearing';
  const isVideo  = media.type === 'video';
  const href = isAudio
    ? `/hearing/${media.type}/${media.slug}`
    : `/sight/${media.type}/${media.slug}`;

  const imgData = media.data as { thumbnailUrl?: string; artworkUrl?: string; previewUrl?: string; aspectRatio?: number; width?: number; height?: number };
  const thumbSrc = imgData.previewUrl ?? imgData.thumbnailUrl ?? imgData.artworkUrl ?? 'https://picsum.photos/seed/fallback/600/400';
  const aspectRatio = imgData.aspectRatio ?? (imgData.width && imgData.height ? +(imgData.width / imgData.height).toFixed(3) : undefined);

  return (
    <a
      href={href}
      className="group block relative rounded-xl overflow-hidden bg-senses-surface
                 hover:shadow-[0_8px_32px_rgba(0,0,0,0.55)] transition-shadow duration-[var(--duration-slow)]"
    >
      {/* Full-bleed image */}
      <div className="relative overflow-hidden" style={aspectRatio ? { aspectRatio: String(aspectRatio) } : {}}>
        {imgError ? (
          <div className="w-full aspect-video bg-senses-surface-2 flex items-center justify-center text-senses-text-3 text-sm">
            Media unavailable
          </div>
        ) : (
          <img
            src={thumbSrc}
            alt={(media.data as {altText?: string}).altText ?? media.title}
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
            className={`w-full object-cover transition-transform duration-[600ms] ease-[var(--ease-senses)] group-hover:scale-[1.04]
              ${isAudio ? 'aspect-square' : ''}
            `}
          />
        )}

        {/* Type badge — always visible */}
        <div className="absolute top-2 left-2 z-10">
          <TypeBadge type={media.type} division={media.division} />
        </div>

        {/* Duration badge for video/audio */}
        {(isVideo || isAudio) && (
          <div className="absolute top-2 right-2 z-10 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-white text-[10px] font-mono">
            {formatDuration((media.data as {duration?: number}).duration ?? 0)}
          </div>
        )}

        {/* Play indicator */}
        {(isVideo || isAudio) && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="p-3 rounded-full bg-black/50 backdrop-blur-sm text-white">
              {isAudio ? <WaveIcon /> : <PlayIcon />}
            </div>
          </div>
        )}

        {/* Top-right action buttons — appear on hover */}
        <div className="absolute top-2 right-2 z-10 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {!(isVideo || isAudio) && (
            <>
              <button
                onClick={handleLike}
                aria-label={liked ? 'Unlike' : 'Like'}
                className={`w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-150 shadow-sm
                  ${liked ? 'bg-red-500/90 text-white' : 'bg-black/50 text-white hover:bg-black/70'}`}
              >
                <HeartIcon filled={liked} />
              </button>
              <button
                onClick={handleSave}
                aria-label={saved ? 'Unsave' : 'Save'}
                className={`w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-150 shadow-sm
                  ${saved ? 'bg-[#FF2D55]/90 text-white' : 'bg-black/50 text-white hover:bg-black/70'}`}
              >
                <BookmarkIcon filled={saved} />
              </button>
            </>
          )}
        </div>

        {/* Slide-up overlay with title + creator + stats */}
        <div
          className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0
                     transition-transform duration-300 ease-[var(--ease-senses)]
                     bg-gradient-to-t from-black/90 via-black/70 to-transparent
                     pt-8 pb-3 px-3"
        >
          {/* Title */}
          <p className="text-white text-[13px] font-medium leading-tight line-clamp-2 mb-1.5">
            {media.title}
          </p>

          {/* Creator row */}
          {creator && (
            <div className="flex items-center gap-1.5 mb-1.5">
              <img
                src={creator.avatar}
                alt={creator.displayName}
                className="w-4 h-4 rounded-full object-cover flex-shrink-0 border border-white/20"
              />
              <span className="text-white/60 text-[11px] truncate">{creator.displayName}</span>
            </div>
          )}

          {/* Stats row */}
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1 text-[11px] ${liked ? 'text-red-400' : 'text-white/50'}`}>
              <HeartIcon filled={liked} />
              {formatCount(media.stats.likes + (liked ? 1 : 0))}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-white/50">
              <EyeIcon />
              {formatCount(media.stats.views)}
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}
