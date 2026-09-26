import { useState, useRef, useCallback } from 'react';
import type { VideoData } from '@/types/index';
import { formatDuration } from '@lib/utils/formatters';

interface Props {
  data: VideoData;
  title: string;
}

export function VideoPlayer({ data, title }: Props) {
  const vidRef  = useRef<HTMLVideoElement>(null);
  const hideRef = useRef<ReturnType<typeof setTimeout>>();
  const [playing,      setPlaying]      = useState(false);
  const [progress,     setProgress]     = useState(0);
  const [currentTime,  setCurrentTime]  = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [muted,        setMuted]        = useState(false);

  const isPlaceholder = !data.streamUrl || data.streamUrl.startsWith('#');
  const duration      = data.duration ?? 0;

  const revealControls = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideRef.current);
    hideRef.current = setTimeout(() => playing && setShowControls(false), 2800);
  }, [playing]);

  const togglePlay = useCallback(() => {
    const v = vidRef.current;
    if (!v || isPlaceholder) return;
    if (playing) { v.pause(); setPlaying(false); }
    else { v.play().then(() => setPlaying(true)).catch(() => {}); }
  }, [playing, isPlaceholder]);

  const handleTimeUpdate = useCallback(() => {
    const v = vidRef.current;
    if (v?.duration) {
      setProgress(v.currentTime / v.duration);
      setCurrentTime(v.currentTime);
    }
  }, []);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const v = vidRef.current;
    if (!v || isPlaceholder || !v.duration) return;
    const rect  = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    v.currentTime = ratio * v.duration;
    setProgress(ratio);
  }, [isPlaceholder]);

  const toggleMute = useCallback(() => {
    const v = vidRef.current;
    if (!v) return;
    v.muted = !muted;
    setMuted(!muted);
  }, [muted]);

  const toggleFullscreen = useCallback(() => {
    const v = vidRef.current;
    if (!v) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else v.requestFullscreen?.().catch(() => {});
  }, []);

  return (
    <div
      className="relative bg-black rounded-xl overflow-hidden w-full"
      style={{ aspectRatio: data.aspectRatio.replace(':', '/') || '16/9' }}
      onMouseMove={revealControls}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      {isPlaceholder ? (
        /* Placeholder state */
        <>
          {data.thumbnailUrl && (
            <img
              src={data.thumbnailUrl}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover opacity-30"
            />
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-white/50 ml-0.5">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <p className="text-white/40 text-xs">Video preview not available in V1</p>
          </div>
        </>
      ) : (
        /* Real video */
        <>
          <video
            ref={vidRef}
            src={data.streamUrl}
            poster={data.thumbnailUrl}
            className="absolute inset-0 w-full h-full object-cover cursor-pointer"
            muted={muted}
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => { setPlaying(false); setShowControls(true); }}
            onClick={togglePlay}
          />

          {/* Static poster overlay when paused */}
          {!playing && data.thumbnailUrl && (
            <div className="absolute inset-0 cursor-pointer" onClick={togglePlay}>
              <img src={data.thumbnailUrl} alt={title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center transition-transform duration-200 hover:scale-105">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white ml-1">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Controls overlay */}
      {!isPlaceholder && (
        <div
          className={`absolute inset-0 flex flex-col justify-end pointer-events-none transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="bg-gradient-to-t from-black/80 via-black/20 to-transparent px-4 pb-3 pt-10 pointer-events-auto">
            {/* Progress bar */}
            <div className="mb-2.5 group cursor-pointer" onClick={handleSeek}>
              <div className="h-0.5 group-hover:h-1 bg-white/25 rounded-full transition-all duration-150 relative">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-white"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>

            {/* Bottom row */}
            <div className="flex items-center gap-2">
              <button onClick={togglePlay} className="p-1 text-white hover:text-white/80 transition-colors">
                {playing ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M6 5h3v14H6zm9 0h3v14h-3z"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>

              <button onClick={toggleMute} className="p-1 text-white/70 hover:text-white transition-colors">
                {muted ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m17.25 9.75 2.25 2.25m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"/>
                  </svg>
                )}
              </button>

              <span className="text-white/60 text-xs font-mono ml-1">
                {formatDuration(Math.round(currentTime))} / {formatDuration(duration)}
              </span>

              <div className="ml-auto flex items-center gap-2">
                {data.resolution && (
                  <span className="text-white/40 text-[10px] font-mono">{data.resolution}</span>
                )}
                <button onClick={toggleFullscreen} className="p-1 text-white/70 hover:text-white transition-colors">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
