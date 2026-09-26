import { useState, useCallback, useEffect } from 'react';
import type { Media } from '@/types/index';
import { toggleLike, toggleSave, getLocalState, recordView } from '@lib/utils/localState';
import { formatCount } from '@lib/utils/formatters';
import { DownloadModal }          from '@/components/download/DownloadModal';
import { SaveToCollectionModal }  from '@/components/collections/SaveToCollectionModal';

interface Props {
  media: Media;
}

export function MediaActions({ media }: Props) {
  const state  = getLocalState();
  const [liked,           setLiked]           = useState(state.likedMediaIds.includes(media.id));
  const [saved,           setSaved]           = useState(state.savedMediaIds.includes(media.id));
  const [copied,          setCopied]          = useState(false);
  const [showDownload,    setShowDownload]    = useState(false);
  const [showCollection,  setShowCollection]  = useState(false);

  useEffect(() => {
    recordView(media.id, media.tags, media.moods, media.category);
  }, [media.id]);

  const handleLike = useCallback(() => setLiked(toggleLike(media.id)), [media.id]);
  const handleSave = useCallback(() => setSaved(toggleSave(media.id)), [media.id]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  }, []);

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Like */}
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 border
            ${liked
              ? 'bg-red-500/15 border-red-500/35 text-red-400'
              : 'bg-senses-surface border-senses-border text-senses-text-2 hover:border-senses-border-2 hover:text-senses-text'}`}
        >
          <svg viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"/>
          </svg>
          {formatCount(media.stats.likes + (liked ? 1 : 0))}
        </button>

        {/* Save */}
        <button
          onClick={handleSave}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 border
            ${saved
              ? 'bg-senses-accent/15 border-senses-accent/35 text-senses-accent'
              : 'bg-senses-surface border-senses-border text-senses-text-2 hover:border-senses-border-2 hover:text-senses-text'}`}
        >
          <svg viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"/>
          </svg>
          {saved ? 'Saved' : 'Save'}
        </button>

        {/* Add to Collection */}
        <button
          onClick={() => setShowCollection(true)}
          title="Add to collection"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium bg-senses-surface border border-senses-border text-senses-text-2 hover:border-senses-border-2 hover:text-senses-text transition-all duration-200"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"/>
          </svg>
          <span className="hidden sm:inline">Collect</span>
        </button>

        {/* Share */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium bg-senses-surface border border-senses-border text-senses-text-2 hover:border-senses-border-2 hover:text-senses-text transition-all duration-200"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"/>
          </svg>
          {copied ? 'Copied!' : 'Share'}
        </button>

        {/* Download */}
        <button
          onClick={() => setShowDownload(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium bg-senses-surface border border-senses-border text-senses-text-2 hover:border-senses-border-2 hover:text-senses-text transition-all duration-200"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"/>
          </svg>
          Download
        </button>
      </div>

      {/* Portals */}
      {showDownload   && <DownloadModal   media={media} onClose={() => setShowDownload(false)} />}
      {showCollection && <SaveToCollectionModal mediaId={media.id} onClose={() => setShowCollection(false)} />}
    </>
  );
}
