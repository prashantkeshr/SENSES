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
    <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    </svg>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
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
  const mediaUrl = `/sight/${media.type}/${media.slug}`;
  const audioUrl = `/hearing/${media.type}/${media.slug}`;
  const href = isAudio ? audioUrl : mediaUrl;

  const imgData = media.data as { thumbnailUrl?: string; artworkUrl?: string };
  const thumbSrc = imgData.thumbnailUrl ?? imgData.artworkUrl ?? 'https://picsum.photos/seed/fallback/600/400';

  return (
    <a
      href={href}
      className="group block relative rounded-xl overflow-hidden bg-senses-surface border border-senses-border
                 hover:border-senses-border-2 transition-all duration-[var(--duration-slow)] ease-[var(--ease-senses)]
                 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
    >
      {/* Image / Artwork */}
      <div className="relative overflow-hidden">
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
            className={`w-full object-cover transition-transform duration-[600ms] ease-[var(--ease-senses)] group-hover:scale-[1.03]
              ${isAudio ? 'aspect-square' : ''}
            `}
          />
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent
                        opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--duration-slow)]
                        flex flex-col justify-end p-3">
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              <button
                onClick={handleLike}
                aria-label={liked ? 'Unlike' : 'Like'}
                className={`p-1.5 rounded-lg backdrop-blur-sm transition-all duration-[var(--duration-base)]
                  ${liked ? 'bg-red-500/80 text-white' : 'bg-black/40 text-white hover:bg-black/60'}`}
              >
                <HeartIcon filled={liked} />
              </button>
              <button
                onClick={handleSave}
                aria-label={saved ? 'Unsave' : 'Save'}
                className={`p-1.5 rounded-lg backdrop-blur-sm transition-all duration-[var(--duration-base)]
                  ${saved ? 'bg-senses-accent/80 text-senses-bg' : 'bg-black/40 text-white hover:bg-black/60'}`}
              >
                <BookmarkIcon filled={saved} />
              </button>
            </div>

            {/* Play indicator for video/audio */}
            {(isVideo || isAudio) && (
              <div className="p-1.5 rounded-lg bg-black/40 backdrop-blur-sm text-white">
                {isAudio ? <WaveIcon /> : <PlayIcon />}
              </div>
            )}
          </div>
        </div>

        {/* Type badge */}
        <div className="absolute top-2 left-2">
          <TypeBadge type={media.type} division={media.division} />
        </div>

        {/* Duration for video/audio */}
        {(isVideo || isAudio) && (
          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-white text-[10px] font-mono">
            {formatDuration((media.data as {duration?: number}).duration ?? 0)}
          </div>
        )}
      </div>

      {/* Card footer */}
      <div className="p-3">
        <p className="text-senses-text text-sm font-normal leading-tight line-clamp-1 mb-1">
          {media.title}
        </p>
        <div className="flex items-center justify-between">
          {creator && (
            <span className="text-senses-text-3 text-xs">{creator.displayName}</span>
          )}
          <div className="flex items-center gap-2 text-senses-text-3 text-[11px] ml-auto">
            <span>{formatCount(media.stats.views)} views</span>
            <span>·</span>
            <span className={liked ? 'text-red-400' : ''}>{formatCount(media.stats.likes + (liked ? 1 : 0))}</span>
          </div>
        </div>
      </div>
    </a>
  );
}
