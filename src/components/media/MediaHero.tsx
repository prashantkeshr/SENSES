import { useState } from 'react';
import type { Media, ImageData, VideoData } from '@/types/index';
import { VideoPlayer } from './VideoPlayer';
import { Lightbox } from './Lightbox';

interface Props {
  media: Media;
}

export function MediaHero({ media }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (media.type === 'video') {
    return <VideoPlayer data={media.data as VideoData} title={media.title} />;
  }

  const imgData = media.data as ImageData;
  const src     = imgData.previewUrl ?? imgData.thumbnailUrl;

  return (
    <>
      <div
        className="relative group cursor-zoom-in rounded-xl overflow-hidden bg-senses-surface"
        onClick={() => setLightboxOpen(true)}
      >
        <img
          src={src}
          alt={imgData.altText ?? media.title}
          loading="eager"
          decoding="sync"
          className="w-full max-h-[78vh] object-contain"
        />

        {/* Expand hint */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="px-3.5 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-white text-sm flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"/>
            </svg>
            View full size
          </div>
        </div>

        {/* Subtle gradient at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-senses-bg/60 to-transparent pointer-events-none" />
      </div>

      {lightboxOpen && <Lightbox media={media} onClose={() => setLightboxOpen(false)} />}
    </>
  );
}
