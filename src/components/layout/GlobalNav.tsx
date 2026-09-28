import { useState, useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';

const sightLinks = [
  { label: 'Photos',        href: '/sight/photos' },
  { label: 'Videos',        href: '/sight/videos' },
  { label: 'Illustrations', href: '/sight/illustrations' },
  { label: 'Wallpapers',    href: '/sight/wallpapers' },
];

const hearingLinks = [
  { label: 'Music',   href: '/hearing/music' },
  { label: 'Sounds',  href: '/hearing/sounds' },
  { label: 'Ambient', href: '/hearing/ambient' },
];

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M8 5.14v14l11-7-11-7z" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

function GalleryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}

export default function GlobalNav() {
  const { openSearch, mobileNavOpen, toggleMobileNav, closeMobileNav } = useUIStore();
  const [scrolled,    setScrolled]    = useState(false);
  const [sightOpen,   setSightOpen]   = useState(false);
  const [hearingOpen, setHearingOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [openSearch]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
          ${scrolled ? 'bg-senses-bg/95 backdrop-blur-md border-b border-senses-border shadow-lg shadow-black/20' : 'bg-transparent'}`}
        style={{ height: 'var(--nav-height)' }}
      >
        <nav className="max-w-[1440px] mx-auto px-4 md:px-8 h-full flex items-center justify-between gap-6">

          {/* Animated Dancing Script brand */}
          <a href="/" className="brand-shimmer text-[3rem] flex-shrink-0 select-none flex items-center gap-2.5" style={{ lineHeight: 1 }}>
            <img src="/icons/favicon-dark.png" alt="" width={28} height={28} className="rounded-full opacity-90 flex-shrink-0 dark:block hidden" />
            <img src="/icons/favicon-light.png" alt="" width={28} height={28} className="rounded-full opacity-90 flex-shrink-0 dark:hidden block" />
            Senses
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-0.5 flex-1 max-w-2xl">

            {/* SIGHT dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setSightOpen(true)}
              onMouseLeave={() => setSightOpen(false)}
            >
              <a href="/sight"
                className="px-3 py-1.5 text-sm sight-accent hover:opacity-80 transition-opacity rounded-lg hover:bg-senses-surface flex items-center gap-1">
                Sight
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 opacity-60">
                  <path d="M8 11L2 5h12z"/>
                </svg>
              </a>
              {sightOpen && (
                <div className="absolute top-full left-0 mt-1 bg-senses-surface border border-senses-border rounded-xl shadow-2xl shadow-black/40 py-1.5 min-w-[170px] animate-fade-in">
                  {sightLinks.map(l => (
                    <a key={l.href} href={l.href}
                      className="block px-4 py-2 text-sm text-senses-text-2 hover:text-senses-text hover:bg-senses-surface-2 transition-colors">
                      {l.label}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* HEARING dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setHearingOpen(true)}
              onMouseLeave={() => setHearingOpen(false)}
            >
              <a href="/hearing"
                className="px-3 py-1.5 text-sm hearing-accent hover:opacity-80 transition-opacity rounded-lg hover:bg-senses-surface flex items-center gap-1">
                Hearing
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 opacity-60">
                  <path d="M8 11L2 5h12z"/>
                </svg>
              </a>
              {hearingOpen && (
                <div className="absolute top-full left-0 mt-1 bg-senses-surface border border-senses-border rounded-xl shadow-2xl shadow-black/40 py-1.5 min-w-[170px] animate-fade-in">
                  {hearingLinks.map(l => (
                    <a key={l.href} href={l.href}
                      className="block px-4 py-2 text-sm text-senses-text-2 hover:text-senses-text hover:bg-senses-surface-2 transition-colors">
                      {l.label}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <a href="/explore" className="px-3 py-1.5 text-sm text-senses-text-2 hover:text-senses-text transition-colors rounded-lg hover:bg-senses-surface">
              Explore
            </a>

            {/* Gallery link with icon */}
            <a href="/gallery" className="px-3 py-1.5 text-sm text-senses-text-2 hover:text-senses-text transition-colors rounded-lg hover:bg-senses-surface flex items-center gap-1.5">
              <GalleryIcon />
              Gallery
            </a>

            <a href="/collections" className="px-3 py-1.5 text-sm text-senses-text-2 hover:text-senses-text transition-colors rounded-lg hover:bg-senses-surface">
              Collections
            </a>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">

            {/* Search */}
            <button
              onClick={openSearch}
              aria-label="Search (Ctrl+K)"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-senses-surface border border-senses-border
                         text-senses-text-2 hover:text-senses-text hover:border-senses-border-2
                         transition-all duration-200 text-sm"
            >
              <SearchIcon />
              <span className="hidden sm:inline text-xs">Search</span>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 text-[10px] text-senses-text-3 font-mono bg-senses-surface-2 rounded px-1 py-0.5">
                ⌘K
              </kbd>
            </button>

            {/* Dedicated Reel button */}
            <a
              href="/discover"
              className="reel-glow hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full
                         bg-senses-accent text-white text-sm font-semibold
                         transition-all duration-200 select-none"
            >
              <PlayIcon />
              <span className="hidden md:inline">Reel</span>
            </a>

            {/* Settings icon */}
            <a
              href="/settings"
              aria-label="Settings"
              className="hidden md:flex p-2 rounded-lg text-senses-text-3 hover:text-senses-text hover:bg-senses-surface transition-colors"
            >
              <SettingsIcon />
            </a>

            {/* My Senses */}
            <a
              href="/my-senses"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                         bg-senses-surface border border-senses-border text-senses-text-2
                         hover:text-senses-text hover:border-senses-border-2 text-sm
                         transition-all duration-200"
            >
              My Senses
            </a>

            {/* Mobile menu toggle */}
            <button
              onClick={toggleMobileNav}
              aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
              className="md:hidden p-2 rounded-lg text-senses-text-2 hover:text-senses-text hover:bg-senses-surface transition-colors"
            >
              {mobileNavOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile nav drawer */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={closeMobileNav}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="absolute top-[var(--nav-height)] left-0 right-0 bg-senses-bg border-b border-senses-border
                       p-4 animate-slide-up shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col gap-1">
              {/* Reel CTA at top of mobile menu */}
              <a href="/discover" onClick={closeMobileNav}
                className="reel-glow flex items-center justify-center gap-2 py-3 rounded-xl
                           bg-senses-accent text-white font-semibold mb-2">
                <PlayIcon /> Enter Reel Feed
              </a>

              <a href="/explore"    onClick={closeMobileNav} className="px-4 py-2.5 text-senses-text-2 hover:text-senses-text hover:bg-senses-surface rounded-lg transition-colors">Explore</a>
              <a href="/gallery"    onClick={closeMobileNav} className="px-4 py-2.5 text-senses-text-2 hover:text-senses-text hover:bg-senses-surface rounded-lg transition-colors flex items-center gap-2"><GalleryIcon /> Gallery Wall</a>
              <a href="/collections" onClick={closeMobileNav} className="px-4 py-2.5 text-senses-text-2 hover:text-senses-text hover:bg-senses-surface rounded-lg transition-colors">Collections</a>

              <div className="border-t border-senses-border my-2" />
              <p className="px-4 text-[10px] tracking-widest text-senses-sight uppercase mb-1">Sight</p>
              {sightLinks.map(l => (
                <a key={l.href} href={l.href} onClick={closeMobileNav} className="px-4 py-2 text-senses-text-2 hover:text-senses-text hover:bg-senses-surface rounded-lg transition-colors">{l.label}</a>
              ))}

              <div className="border-t border-senses-border my-2" />
              <p className="px-4 text-[10px] tracking-widest text-senses-hearing uppercase mb-1">Hearing</p>
              {hearingLinks.map(l => (
                <a key={l.href} href={l.href} onClick={closeMobileNav} className="px-4 py-2 text-senses-text-2 hover:text-senses-text hover:bg-senses-surface rounded-lg transition-colors">{l.label}</a>
              ))}

              <div className="border-t border-senses-border my-2" />
              <a href="/my-senses" onClick={closeMobileNav} className="px-4 py-2.5 text-senses-text-2 hover:text-senses-text hover:bg-senses-surface rounded-lg transition-colors">My Senses</a>
              <a href="/settings"  onClick={closeMobileNav} className="px-4 py-2.5 text-senses-text-2 hover:text-senses-text hover:bg-senses-surface rounded-lg transition-colors flex items-center gap-2"><SettingsIcon /> Settings</a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
