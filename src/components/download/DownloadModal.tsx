import { useState, useEffect, useRef } from 'react';
import type { Media } from '@/types/index';
import { recordDownload } from '@/lib/utils/downloads';
import { formatCount } from '@/lib/utils/formatters';

interface Props {
  media:     Media;
  onClose:   () => void;
}

const LICENSE_INFO: Record<string, { label: string; free: boolean; note: string }> = {
  cc0:            { label: 'CC0 Public Domain',      free: true,  note: 'Free for any use. No attribution required.' },
  'cc-by':        { label: 'Creative Commons BY',    free: true,  note: 'Free to use with attribution to the creator.' },
  'cc-by-sa':     { label: 'Creative Commons BY-SA', free: true,  note: 'Free with attribution; derivatives must use the same license.' },
  editorial:      { label: 'Editorial Use Only',     free: false, note: 'May only be used in editorial contexts, not for commercial products.' },
  commercial:     { label: 'Commercial License',     free: false, note: 'A license must be purchased for commercial use.' },
  'senses-original': { label: 'SENSES Original',    free: true,  note: 'Available under SENSES platform terms for personal use.' },
  placeholder:    { label: 'Placeholder',             free: true,  note: 'Demo content — replace with real media in production.' },
};

export function DownloadModal({ media, onClose }: Props) {
  const [agreed,    setAgreed]    = useState(false);
  const [format,    setFormat]    = useState('original');
  const [triggered, setTriggered] = useState(false);
  const backdropRef               = useRef<HTMLDivElement>(null);

  const licInfo   = LICENSE_INFO[media.license] ?? LICENSE_INFO['placeholder'];
  const needsAck  = !licInfo.free;

  const imgData   = media.data as { fullUrl?: string; previewUrl?: string; thumbnailUrl?: string };
  const audioData = media.data as { streamUrl?: string; artworkUrl?: string };

  const downloadUrl = media.division === 'hearing'
    ? (audioData.streamUrl?.startsWith('#') ? null : audioData.streamUrl ?? media.thumbnail)
    : (format === 'preview' ? imgData.previewUrl : imgData.fullUrl) ?? imgData.previewUrl ?? media.thumbnail;

  // Close on backdrop click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (e.target === backdropRef.current) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleDownload = () => {
    if (needsAck && !agreed) return;
    recordDownload(media.id, media.license, format);
    setTriggered(true);
    setTimeout(onClose, 600);
  };

  const canDownload = !needsAck || agreed;
  const isPlaceholder = !downloadUrl || downloadUrl.startsWith('#');

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Download media"
    >
      <div className="w-full max-w-md bg-senses-bg border border-senses-border rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-senses-border">
          <h2 className="text-senses-text text-sm font-medium">Download</h2>
          <button onClick={onClose} className="text-senses-text-3 hover:text-senses-text transition-colors p-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Preview row */}
        <div className="flex gap-4 p-5 border-b border-senses-border">
          <img src={media.thumbnail} alt={media.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-senses-border" />
          <div className="min-w-0">
            <p className="text-senses-text text-sm font-medium truncate">{media.title}</p>
            <p className="text-senses-text-3 text-xs mt-0.5 capitalize">{media.type} · {media.division}</p>
            <p className="text-senses-text-3 text-xs mt-1">{formatCount(media.stats.downloads + 1)} downloads</p>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Format selector (sight only) */}
          {media.division === 'sight' && (
            <div>
              <p className="text-senses-text-3 text-xs uppercase tracking-wider mb-2 font-medium">Format</p>
              <div className="flex gap-2">
                {[['original', 'Original'], ['preview', 'Preview']].map(([val, lbl]) => (
                  <button
                    key={val}
                    onClick={() => setFormat(val)}
                    className={`flex-1 py-2 rounded-lg text-sm transition-all border ${
                      format === val
                        ? 'bg-senses-surface-2 border-senses-border-2 text-senses-text'
                        : 'bg-senses-surface border-senses-border text-senses-text-3 hover:text-senses-text-2'
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* License */}
          <div className={`rounded-xl p-4 border ${
            licInfo.free
              ? 'bg-emerald-900/10 border-emerald-700/20'
              : 'bg-amber-900/10 border-amber-700/20'
          }`}>
            <div className="flex items-center gap-2 mb-1.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
                className={`w-4 h-4 flex-shrink-0 ${licInfo.free ? 'text-emerald-400' : 'text-amber-400'}`}>
                {licInfo.free
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/>
                }
              </svg>
              <span className={`text-xs font-medium ${licInfo.free ? 'text-emerald-400' : 'text-amber-400'}`}>
                {licInfo.label}
              </span>
            </div>
            <p className="text-senses-text-3 text-xs leading-relaxed">{licInfo.note}</p>
          </div>

          {/* Acknowledgment checkbox for paid/restricted licenses */}
          {needsAck && (
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className={`mt-0.5 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all ${
                agreed ? 'bg-senses-accent border-senses-accent' : 'bg-senses-surface border-senses-border group-hover:border-senses-border-2'
              }`}
                onClick={() => setAgreed(!agreed)}
              >
                {agreed && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-3 h-3 text-senses-bg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                  </svg>
                )}
              </div>
              <input type="checkbox" className="sr-only" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
              <span className="text-senses-text-3 text-xs leading-relaxed">
                I understand this content is <strong className="text-senses-text-2">{licInfo.label}</strong> and agree to use it accordingly.
              </span>
            </label>
          )}

          {/* Placeholder notice */}
          {isPlaceholder && (
            <p className="text-senses-text-3 text-xs text-center py-1">
              Demo content — download not available in preview.
            </p>
          )}

          {/* Action */}
          {!isPlaceholder ? (
            triggered ? (
              <div className="flex items-center justify-center gap-2 py-3 text-emerald-400 text-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                </svg>
                Download started
              </div>
            ) : (
              <a
                href={downloadUrl ?? '#'}
                download
                target="_blank"
                rel="noopener noreferrer"
                onClick={canDownload ? handleDownload : e => e.preventDefault()}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
                  canDownload
                    ? 'bg-senses-text text-senses-bg hover:bg-senses-accent cursor-pointer'
                    : 'bg-senses-surface border border-senses-border text-senses-text-3 cursor-not-allowed opacity-50'
                }`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"/>
                </svg>
                Download {format === 'preview' && media.division === 'sight' ? 'Preview' : 'Original'}
              </a>
            )
          ) : (
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl text-sm bg-senses-surface border border-senses-border text-senses-text-2"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
