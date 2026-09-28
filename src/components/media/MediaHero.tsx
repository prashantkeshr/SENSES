import { useState, useCallback, useEffect } from 'react';
import type { Media, ImageData, VideoData } from '@/types/index';
import { VideoPlayer } from './VideoPlayer';
import { Lightbox }    from './Lightbox';

interface Props {
  media: Media;
}

function getAmbientEnabled(): boolean {
  try {
    const s = JSON.parse(localStorage.getItem('senses:settings') ?? '{}');
    return s.ambientLight !== false; // on by default
  } catch { return true; }
}

function setAmbientEnabled(val: boolean) {
  try {
    const s = JSON.parse(localStorage.getItem('senses:settings') ?? '{}');
    s.ambientLight = val;
    localStorage.setItem('senses:settings', JSON.stringify(s));
  } catch {}
}

export function MediaHero({ media }: Props) {
  const [lightboxOpen,    setLightboxOpen]    = useState(false);
  const [ambientOn,       setAmbientOn]       = useState(true);
  const [ambientColor,    setAmbientColor]    = useState<string>('');

  // Read ambient setting from localStorage on mount
  useEffect(() => {
    setAmbientOn(getAmbientEnabled());
  }, []);

  // Derive ambient color from media.colors (already extracted by data pipeline)
  useEffect(() => {
    const colors = (media as { colors?: string[] }).colors;
    if (colors && colors.length > 0) {
      setAmbientColor(colors[0]);
    }
  }, [media]);

  // Dispatch ambient event whenever ambient state or color changes
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('senses:ambient', {
      detail: { color: ambientColor, enabled: ambientOn },
    }));
  }, [ambientColor, ambientOn]);

  // Listen for open-lightbox event from MediaActions (same page, different island)
  useEffect(() => {
    const handler = () => setLightboxOpen(true);
    window.addEventListener('senses:open-lightbox', handler);
    return () => window.removeEventListener('senses:open-lightbox', handler);
  }, []);

  const toggleAmbient = useCallback(() => {
    setAmbientOn(prev => {
      const next = !prev;
      setAmbientEnabled(next);
      return next;
    });
  }, []);

  if (media.type === 'video') {
    return <VideoPlayer data={media.data as VideoData} title={media.title} />;
  }

  const imgData = media.data as ImageData;
  const src     = imgData.previewUrl ?? imgData.thumbnailUrl;

  const glowStyle: React.CSSProperties = ambientOn && ambientColor
    ? {
        boxShadow: `0 0 60px 18px ${ambientColor}55, 0 0 120px 40px ${ambientColor}22`,
        transition: 'box-shadow 1s ease',
      }
    : { transition: 'box-shadow 0.5s ease' };

  return (
    <>
      <div className="relative" style={glowStyle}>
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

          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-senses-bg/60 to-transparent pointer-events-none" />
        </div>

        {/* Ambient light toggle */}
        {ambientColor && (
          <button
            onClick={toggleAmbient}
            title={ambientOn ? 'Turn off ambient lighting' : 'Turn on ambient lighting'}
            className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
                       bg-black/50 backdrop-blur-sm border border-white/10
                       text-white/60 hover:text-white text-[11px] transition-all z-10"
          >
            <svg viewBox="0 0 24 24" fill={ambientOn ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"/>
            </svg>
            {ambientOn ? 'Ambient' : 'Ambient off'}
          </button>
        )}
      </div>

      {lightboxOpen && <Lightbox media={media} onClose={() => setLightboxOpen(false)} />}
    </>
  );
}
