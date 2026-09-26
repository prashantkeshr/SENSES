import { useState, useRef, useEffect, useCallback } from 'react';
import type { AudioData } from '@/types/index';
import { formatDuration } from '@lib/utils/formatters';

interface Props {
  data: AudioData;
  title: string;
  accentColor?: string;
}

// Returns integer percentages (25–100) to avoid SSR/client float mismatch
function buildWaveform(bars: number): number[] {
  const w: number[] = [];
  for (let i = 0; i < bars; i++) {
    const t = i / bars;
    const v = 0.25 + 0.4 * Math.abs(Math.sin(t * Math.PI * 3.7 + 0.5))
            + 0.18 * Math.abs(Math.sin(t * Math.PI * 8.1 + 1.2))
            + 0.17 * Math.abs(Math.sin(t * Math.PI * 14.6 + 0.8));
    w.push(Math.round(Math.min(1, v) * 100));
  }
  return w;
}

const BARS = 60;
const WAVEFORM = buildWaveform(BARS);

export function AudioPlayer({ data, title, accentColor = '#8FAEC0' }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const isPlaceholder = !data.streamUrl || data.streamUrl.startsWith('#');
  const duration = data.duration ?? 0;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => {
      if (audio.duration) {
        setProgress(audio.currentTime / audio.duration);
        setCurrentTime(audio.currentTime);
      }
    };
    const onEnd  = () => setPlaying(false);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnd);
    audio.volume = volume;
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('ended', onEnd);
    };
  }, [volume]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || isPlaceholder) return;
    if (playing) { audio.pause(); setPlaying(false); }
    else { audio.play().then(() => setPlaying(true)).catch(() => {}); }
  }, [playing, isPlaceholder]);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || isPlaceholder || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * audio.duration;
    setProgress(ratio);
  }, [isPlaceholder]);

  const handleVolume = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
    if (v === 0) setMuted(true);
    else setMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !muted;
    setMuted(!muted);
  }, [muted]);

  return (
    <div className="w-full select-none">
      {!isPlaceholder && (
        <audio ref={audioRef} src={data.streamUrl} preload="metadata" />
      )}

      {/* Waveform */}
      <div
        className={`h-14 mb-3 ${isPlaceholder ? 'cursor-default opacity-60' : 'cursor-pointer'}`}
        style={{ display: 'grid', gridTemplateColumns: `repeat(${BARS}, 1fr)`, gap: '2px', alignItems: 'flex-end' }}
        onClick={handleSeek}
        role="slider"
        aria-label="Seek audio"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        suppressHydrationWarning
      >
        {WAVEFORM.map((h, i) => {
          const played = i / BARS < progress;
          return (
            <div
              key={i}
              suppressHydrationWarning
              style={{
                height: `${h}%`,
                backgroundColor: played ? accentColor : `${accentColor}30`,
                borderRadius: '1px',
                transition: 'background-color 80ms',
              }}
            />
          );
        })}
      </div>

      {/* Time */}
      <div className="flex justify-between text-[11px] text-senses-text-3 font-mono mb-4">
        <span>{formatDuration(Math.round(currentTime))}</span>
        <span>{formatDuration(duration)}</span>
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-3">
        {/* Play / Pause */}
        <button
          onClick={togglePlay}
          disabled={isPlaceholder}
          aria-label={playing ? 'Pause' : 'Play'}
          className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full transition-all duration-200
            ${isPlaceholder
              ? 'bg-senses-surface-2 text-senses-text-3 cursor-not-allowed'
              : 'hover:scale-105 active:scale-95'}`}
          style={isPlaceholder ? {} : { backgroundColor: `${accentColor}20`, color: accentColor }}
        >
          {playing ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M6 5h3v14H6zm9 0h3v14h-3z"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 ml-0.5">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </button>

        {/* Volume */}
        <button
          onClick={toggleMute}
          className="p-1.5 text-senses-text-3 hover:text-senses-text transition-colors flex-shrink-0"
          aria-label={muted ? 'Unmute' : 'Mute'}
        >
          {muted || volume === 0 ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m17.25 9.75 2.25 2.25m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"/>
            </svg>
          )}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={muted ? 0 : volume}
          onChange={handleVolume}
          className="w-20 h-0.5 rounded-full appearance-none"
          style={{ accentColor }}
        />

        {isPlaceholder && (
          <span className="ml-auto text-[11px] text-senses-text-3">
            Preview unavailable (V1 placeholder)
          </span>
        )}
      </div>
    </div>
  );
}
