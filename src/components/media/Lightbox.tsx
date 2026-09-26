import { useEffect, useCallback } from 'react';
import type { Media, ImageData } from '@/types/index';

interface Props {
  media: Media;
  onClose: () => void;
}

export function Lightbox({ media, onClose }: Props) {
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [handleKey]);

  const imgData = media.data as ImageData;
  const src = imgData.fullUrl ?? imgData.previewUrl ?? media.thumbnail;
  const alt = imgData.altText ?? media.title;

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/96 backdrop-blur-sm flex flex-col animate-fade-in"
      onClick={onClose}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-white/5 flex-shrink-0"
        onClick={e => e.stopPropagation()}
      >
        <p className="text-white/60 text-sm truncate max-w-[60%]">{media.title}</p>
        <div className="flex items-center gap-2">
          <a
            href={src}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-white/8 text-white/70 hover:bg-white/15 hover:text-white text-sm transition-all flex items-center gap-1.5"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"/>
            </svg>
            Download
          </a>
          <button
            onClick={() => { navigator.clipboard.writeText(window.location.href).catch(() => {}); }}
            className="px-3 py-1.5 rounded-lg bg-white/8 text-white/70 hover:bg-white/15 hover:text-white text-sm transition-all flex items-center gap-1.5"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"/>
            </svg>
            Share
          </button>
          <button
            onClick={onClose}
            aria-label="Close viewer"
            className="p-1.5 rounded-lg bg-white/8 text-white/70 hover:bg-white/15 hover:text-white transition-all"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Image area */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-full object-contain select-none"
          style={{ imageRendering: 'crisp-edges' }}
          onClick={e => e.stopPropagation()}
        />
      </div>

      {/* Bottom info */}
      <div
        className="flex items-center justify-center gap-4 px-4 py-3 border-t border-white/5 flex-shrink-0"
        onClick={e => e.stopPropagation()}
      >
        <span className="text-white/30 text-xs font-mono">
          {imgData.width} × {imgData.height} px · {imgData.format} · {imgData.aspectRatio}
        </span>
      </div>
    </div>
  );
}
