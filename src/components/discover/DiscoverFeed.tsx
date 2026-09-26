import { useState, useEffect, useRef, useCallback } from 'react';
import type { Media, Creator, ImageData, AudioData } from '@/types/index';
import { toggleLike, toggleSave, getLocalState } from '@/lib/utils/localState';
import { formatCount } from '@/lib/utils/formatters';

interface Props {
  media:    Media[];
  creators: Creator[];
}

// ── Icons ────────────────────────────────────────────────────────────────────

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    </svg>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

function ChevronUpIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
    </svg>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function bgImage(m: Media): string {
  const d = m.data as ImageData & { artworkUrl?: string; thumbnailUrl?: string };
  return d.artworkUrl ?? d.thumbnailUrl ?? d.previewUrl ?? m.thumbnail;
}

function detailHref(m: Media) {
  return m.division === 'hearing'
    ? `/hearing/${m.type}/${m.slug}`
    : `/sight/${m.type}/${m.slug}`;
}

// ── Side action button ────────────────────────────────────────────────────────

function ActionBtn({
  onClick,
  active = false,
  activeClass = '',
  label,
  count,
  children,
}: {
  onClick?: () => void;
  active?: boolean;
  activeClass?: string;
  label: string;
  count?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex flex-col items-center gap-1 group"
    >
      <div className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10 transition-all
        ${active ? activeClass : 'bg-black/30 text-white/70 hover:bg-black/50 hover:text-white'}`}
      >
        {children}
      </div>
      {count !== undefined && (
        <span className="text-white/50 text-[10px] tabular-nums">{count}</span>
      )}
    </button>
  );
}

// ── DiscoverFeed ─────────────────────────────────────────────────────────────

export function DiscoverFeed({ media, creators }: Props) {
  const [current,  setCurrent]  = useState(0);
  const [liked,    setLiked]    = useState<Set<string>>(new Set());
  const [saved,    setSaved]    = useState<Set<string>>(new Set());
  const [shared,   setShared]   = useState<string | null>(null);
  const [playing,  setPlaying]  = useState<string | null>(null);
  const [mounted,  setMounted]  = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRefs    = useRef<Record<string, HTMLAudioElement | null>>({});

  const creatorMap = Object.fromEntries(creators.map(c => [c.id, c]));

  useEffect(() => {
    const state = getLocalState();
    setLiked(new Set(state.likedMediaIds));
    setSaved(new Set(state.savedMediaIds));
    setMounted(true);
  }, []);

  // Track current card via IntersectionObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const idx = parseInt((e.target as HTMLElement).dataset.index ?? '0', 10);
            setCurrent(idx);
            // Pause any playing audio when leaving a card
            setPlaying(prev => {
              if (prev && media[idx].id !== prev) {
                const audio = audioRefs.current[prev];
                audio?.pause();
                return null;
              }
              return prev;
            });
          }
        });
      },
      { threshold: 0.55 }
    );
    Array.from(container.children).forEach(c => io.observe(c));
    return () => io.disconnect();
  }, [media]);

  const scrollTo = useCallback((idx: number) => {
    const container = containerRef.current;
    if (!container) return;
    const child = container.children[idx] as HTMLElement | undefined;
    child?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowDown' || e.key === 'j') { e.preventDefault(); scrollTo(Math.min(current + 1, media.length - 1)); }
      if (e.key === 'ArrowUp'   || e.key === 'k') { e.preventDefault(); scrollTo(Math.max(current - 1, 0)); }
      if (e.key === ' ') { e.preventDefault(); toggleAudio(media[current]?.id); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [current, media, scrollTo]);

  const toggleAudio = useCallback((id: string | undefined) => {
    if (!id) return;
    const audio = audioRefs.current[id];
    if (!audio) return;
    if (playing === id) {
      audio.pause();
      setPlaying(null);
    } else {
      Object.values(audioRefs.current).forEach(a => a?.pause());
      audio.play().then(() => setPlaying(id)).catch(() => {});
    }
  }, [playing]);

  const handleLike = (id: string) => {
    toggleLike(id);
    setLiked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSave = (id: string) => {
    toggleSave(id);
    setSaved(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleShare = async (m: Media) => {
    const url = window.location.origin + detailHref(m);
    try { await navigator.clipboard.writeText(url); } catch {}
    setShared(m.id);
    setTimeout(() => setShared(null), 2000);
  };

  if (!mounted) return null;

  return (
    // Scroll-snap container covering the full viewport
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-y-scroll"
      style={{
        scrollSnapType:  'y mandatory',
        scrollbarWidth:  'none',
        msOverflowStyle: 'none',
      } as React.CSSProperties}
    >
      {media.map((m, i) => {
        const creator  = creatorMap[m.creator];
        const isLiked  = liked.has(m.id);
        const isSaved  = saved.has(m.id);
        const isActive = i === current;
        const bg       = bgImage(m);
        const isAudio  = m.division === 'hearing';
        const isPlaying = playing === m.id;
        const audioData = isAudio ? (m.data as AudioData) : null;
        const isPlaceholder = !audioData?.streamUrl || audioData.streamUrl.startsWith('#');

        return (
          <div
            key={m.id}
            data-index={i}
            className="relative w-full h-screen flex-shrink-0 overflow-hidden"
            style={{ scrollSnapAlign: 'start' }}
          >
            {/* ── Background ── */}
            <div className="absolute inset-0">
              <img
                src={bg}
                alt=""
                className={`w-full h-full transition-transform duration-700 ${
                  isAudio
                    ? 'object-cover scale-110 blur-[60px] opacity-20'
                    : 'object-cover'
                }`}
                loading={i < 3 ? 'eager' : 'lazy'}
              />
            </div>

            {/* ── Gradient overlays ── */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/85 pointer-events-none" />

            {/* ── HEARING: album art + play ── */}
            {isAudio && audioData && (
              <>
                {/* Hidden audio element */}
                {!isPlaceholder && (
                  <audio
                    ref={el => { audioRefs.current[m.id] = el; }}
                    src={audioData.streamUrl}
                    preload="none"
                    loop
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="flex flex-col items-center gap-5 pointer-events-auto">
                    {/* Album art */}
                    <div
                      className={`w-44 h-44 rounded-2xl overflow-hidden shadow-2xl border border-white/10 transition-all duration-500 ${
                        isPlaying ? 'scale-105 shadow-[0_0_40px_rgba(143,174,192,0.2)]' : ''
                      }`}
                    >
                      <img
                        src={audioData.artworkUrl ?? m.thumbnail}
                        alt={m.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Play / pause */}
                    <button
                      onClick={() => isPlaceholder ? undefined : toggleAudio(m.id)}
                      disabled={isPlaceholder}
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                      className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all duration-200 ${
                        isPlaceholder
                          ? 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed'
                          : isPlaying
                            ? 'bg-senses-hearing/30 border-senses-hearing/40 text-senses-hearing hover:bg-senses-hearing/40'
                            : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                      }`}
                    >
                      {isPlaying ? (
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                          <path d="M6 5h3v14H6zm9 0h3v14h-3z"/>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 ml-0.5">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      )}
                    </button>

                    {isPlaceholder && (
                      <p className="text-white/30 text-[10px] tracking-wider">Audio preview not available in V1</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ── Item counter ── */}
            {isActive && (
              <div className="absolute right-4 text-white/30 text-[11px] font-mono tabular-nums" style={{ top: 'calc(var(--nav-height) + 16px)' }}>
                {i + 1} / {media.length}
              </div>
            )}

            {/* ── Up arrow (prev) ── */}
            {i > 0 && isActive && (
              <button
                onClick={() => scrollTo(i - 1)}
                aria-label="Previous"
                className="absolute left-1/2 -translate-x-1/2 text-white/25 hover:text-white/60 transition-colors"
                style={{ top: 'calc(var(--nav-height) + 20px)' }}
              >
                <ChevronUpIcon />
              </button>
            )}

            {/* ── Down arrow (next) ── */}
            {i < media.length - 1 && isActive && (
              <button
                onClick={() => scrollTo(i + 1)}
                aria-label="Next"
                className="absolute bottom-28 left-1/2 -translate-x-1/2 text-white/30 hover:text-white/60 transition-colors animate-bounce"
              >
                <ChevronDownIcon />
              </button>
            )}

            {/* ── Side actions ── */}
            <div className="absolute right-4 flex flex-col items-center gap-4" style={{ bottom: '120px' }}>
              <ActionBtn
                onClick={() => handleLike(m.id)}
                active={isLiked}
                activeClass="bg-red-500/25 border-red-500/30 text-red-400"
                label={isLiked ? 'Unlike' : 'Like'}
                count={formatCount(m.stats.likes + (isLiked ? 1 : 0))}
              >
                <HeartIcon filled={isLiked} />
              </ActionBtn>

              <ActionBtn
                onClick={() => handleSave(m.id)}
                active={isSaved}
                activeClass="bg-senses-sight/20 border-senses-sight/30 text-senses-sight"
                label={isSaved ? 'Unsave' : 'Save'}
                count={formatCount(m.stats.saves + (isSaved ? 1 : 0))}
              >
                <BookmarkIcon filled={isSaved} />
              </ActionBtn>

              <ActionBtn
                onClick={() => handleShare(m)}
                label="Share"
                count={shared === m.id ? 'Copied!' : undefined}
                active={shared === m.id}
                activeClass="bg-white/20 border-white/30 text-white"
              >
                <ShareIcon />
              </ActionBtn>

              <a
                href={detailHref(m)}
                aria-label="View full page"
                className="flex flex-col items-center gap-1 group"
              >
                <div className="w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10 bg-black/30 text-white/70 hover:bg-black/50 hover:text-white transition-all">
                  <ExternalLinkIcon />
                </div>
              </a>
            </div>

            {/* ── Bottom info ── */}
            <div className="absolute bottom-0 left-0 right-16 p-5 pb-8">
              {/* Division */}
              <p className={`text-[10px] tracking-[0.25em] uppercase font-medium mb-1.5 ${
                isAudio ? 'text-senses-hearing' : 'text-senses-sight'
              }`}>
                {isAudio ? 'HEARING' : 'SIGHT'} · {m.type}
              </p>

              {/* Title */}
              <h2 className="text-white text-lg font-medium leading-snug mb-2 line-clamp-2">
                {m.title}
              </h2>

              {/* Creator */}
              {creator && (
                <a
                  href={`/creator/${creator.id}`}
                  className="inline-flex items-center gap-2 mb-3 group"
                >
                  <img
                    src={creator.avatar}
                    alt={creator.displayName}
                    className="w-6 h-6 rounded-full object-cover border border-white/20 flex-shrink-0"
                  />
                  <span className="text-white/60 text-sm group-hover:text-white/90 transition-colors">
                    {creator.displayName}
                  </span>
                </a>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {m.tags.slice(0, 4).map(t => (
                  <a
                    key={t}
                    href={`/tag/${t}`}
                    className="px-2 py-0.5 rounded-full bg-white/8 backdrop-blur-sm border border-white/10 text-white/50 text-[10px] hover:text-white/80 hover:bg-white/15 transition-all"
                    style={{ backdropFilter: 'blur(8px)' }}
                  >
                    #{t}
                  </a>
                ))}
              </div>
            </div>

            {/* ── Mood overlay (subtle color tint for hearing) ── */}
            {isAudio && (
              <div
                className="absolute inset-0 pointer-events-none opacity-10"
                style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 50%, #8FAEC0, transparent)' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
