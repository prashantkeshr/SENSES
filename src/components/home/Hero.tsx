import { useState, useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';

const WORDS = ['See more.', 'Hear more.', 'Feel more.'];

const HERO_IMAGES = [
  'https://cdn.pixabay.com/photo/2011/03/16/16/13/tree-5378_640.jpg',
  'https://cdn.pixabay.com/photo/2010/12/13/09/51/fireworks-1758_640.jpg',
  'https://cdn.pixabay.com/photo/2010/12/28/01/00/flowers-4232_640.jpg',
  'https://cdn.pixabay.com/photo/2011/05/31/19/44/rose-7634_640.jpg',
  'https://cdn.pixabay.com/photo/2011/06/29/15/27/wood-8196_640.jpg',
  'https://cdn.pixabay.com/photo/2010/12/13/09/52/peafowl-1868_640.jpg',
  'https://cdn.pixabay.com/photo/2012/01/07/21/56/sunflower-11574_640.jpg',
  'https://cdn.pixabay.com/photo/2012/02/26/10/54/garden-17057_640.jpg',
];

const OVERLAY_COLORS = [
  'rgba(255,45,85,0.18)',
  'rgba(0,100,200,0.15)',
  'rgba(150,60,200,0.15)',
  'rgba(255,165,0,0.14)',
  'rgba(0,180,100,0.14)',
  'rgba(255,45,85,0.18)',
  'rgba(255,200,0,0.14)',
  'rgba(0,180,200,0.13)',
];

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 flex-shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  );
}

export default function Hero() {
  const { openSearch } = useUIStore();
  const [wordIndex,  setWordIndex]  = useState(0);
  const [visible,    setVisible]    = useState(true);
  const [bgIndex,    setBgIndex]    = useState(0);
  const [bgFading,   setBgFading]   = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setWordIndex(i => (i + 1) % WORDS.length);
        setVisible(true);
      }, 400);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgFading(true);
      setTimeout(() => {
        setBgIndex(i => (i + 1) % HERO_IMAGES.length);
        setBgFading(false);
      }, 800);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const popularSearches = ['mountain landscapes', 'rain ambience', 'golden hour', 'ocean waves', 'lo-fi music', 'city night'];

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden px-4">
      {/* Rotating background images */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          key={bgIndex}
          src={HERO_IMAGES[bgIndex]}
          alt=""
          className="absolute inset-0 w-full h-full object-cover scale-110"
          style={{
            opacity: bgFading ? 0 : 0.18,
            transition: 'opacity 800ms ease-in-out',
            filter: 'blur(2px)',
          }}
        />
      </div>

      {/* Dark + neon color-changing overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 40%, ${OVERLAY_COLORS[bgIndex]} 0%, transparent 65%)`,
          transition: 'background 1.2s ease-in-out',
        }}
      />
      {/* Dark vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 120% 100% at 50% 50%, transparent 30%, rgba(8,8,8,0.6) 100%)',
      }} />
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
        backgroundSize: '64px 64px',
      }} />

      <div className="relative z-10 w-full max-w-4xl mx-auto">

        {/* Division chips */}
        <div className="flex items-center justify-center gap-3 mb-12 animate-fade-in">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-senses-sight/30 text-senses-sight text-xs tracking-widest uppercase">
            <span className="w-1 h-1 rounded-full bg-senses-sight inline-block" />
            Sight
          </span>
          <span className="text-senses-text-3 text-xs">·</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-senses-hearing/30 text-senses-hearing text-xs tracking-widest uppercase">
            <span className="w-1 h-1 rounded-full bg-senses-hearing inline-block" />
            Hearing
          </span>
          <span className="text-senses-text-3 text-xs">·</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-senses-border text-senses-text-3 text-xs tracking-widest uppercase">
            More coming
          </span>
        </div>

        {/* Display heading */}
        <h1 className="font-light text-display-2xl text-senses-text mb-4 leading-none tracking-tight animate-slide-up">
          <span
            className="inline-block transition-all duration-400 ease-out"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(12px)',
            }}
          >
            {WORDS[wordIndex]}
          </span>
        </h1>

        <p className="text-senses-text-2 text-lg font-light mb-12 max-w-xl mx-auto leading-relaxed animate-fade-in">
          A premium discovery platform for visual and audio media. Explore, collect, and feel.
        </p>

        {/* Search bar */}
        <div className="w-full max-w-2xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <button
            onClick={openSearch}
            className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl
                       bg-senses-surface border border-senses-border hover:border-senses-border-2
                       text-senses-text-3 hover:text-senses-text-2
                       transition-all duration-[var(--duration-slow)] text-left
                       shadow-[0_0_0_0_rgba(232,228,220,0)] hover:shadow-[0_0_0_1px_rgba(232,228,220,0.06)]"
            aria-label="Open search"
          >
            <SearchIcon />
            <span className="flex-1 text-sm">Discover images, sounds, music, and more...</span>
            <kbd className="hidden sm:flex items-center gap-0.5 text-[10px] font-mono text-senses-text-3 bg-senses-surface-2 border border-senses-border rounded px-1.5 py-0.5">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Popular searches */}
        <div className="flex flex-wrap items-center justify-center gap-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <span className="text-senses-text-3 text-xs mr-1">Popular:</span>
          {popularSearches.map(term => (
            <button
              key={term}
              onClick={openSearch}
              className="px-3 py-1 rounded-full bg-senses-surface border border-senses-border
                         text-senses-text-3 hover:text-senses-text hover:border-senses-border-2
                         text-xs transition-all duration-[var(--duration-base)]"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-senses-text-3 animate-pulse-soft">
        <span className="text-[10px] tracking-widest uppercase">Scroll to explore</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </div>
    </section>
  );
}
