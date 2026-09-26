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

export default function GlobalNav() {
  const { openSearch, mobileNavOpen, toggleMobileNav, closeMobileNav } = useUIStore();
  const [scrolled, setScrolled] = useState(false);
  const [sightOpen, setSightOpen] = useState(false);
  const [hearingOpen, setHearingOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Keyboard shortcut Ctrl+K
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
          ${scrolled ? 'bg-senses-bg/95 backdrop-blur-md border-b border-senses-border' : 'bg-transparent'}`}
        style={{ height: 'var(--nav-height)' }}
      >
        <nav className="max-w-[1440px] mx-auto px-4 md:px-8 h-full flex items-center justify-between gap-6">

          {/* Brand */}
          <a
            href="/"
            className="flex-shrink-0 text-senses-text font-light tracking-[0.3em] text-sm uppercase
                       hover:text-senses-accent transition-colors duration-[var(--duration-base)]"
          >
            SENSES
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <a href="/explore" className="px-3 py-1.5 text-sm text-senses-text-2 hover:text-senses-text transition-colors duration-[var(--duration-base)] rounded-lg hover:bg-senses-surface">
              Explore
            </a>
            <a href="/discover" className="px-3 py-1.5 text-sm text-senses-text-2 hover:text-senses-text transition-colors duration-[var(--duration-base)] rounded-lg hover:bg-senses-surface">
              Discover
            </a>

            {/* SIGHT dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setSightOpen(true)}
              onMouseLeave={() => setSightOpen(false)}
            >
              <a
                href="/sight"
                className="px-3 py-1.5 text-sm sight-accent hover:text-senses-accent transition-colors duration-[var(--duration-base)] rounded-lg hover:bg-senses-surface flex items-center gap-1"
              >
                Sight
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                  <path d="M8 11L2 5h12z"/>
                </svg>
              </a>
              {sightOpen && (
                <div className="absolute top-full left-0 mt-1 bg-senses-surface border border-senses-border rounded-xl shadow-2xl py-1 min-w-[160px] animate-fade-in">
                  {sightLinks.map(l => (
                    <a key={l.href} href={l.href}
                      className="block px-4 py-2 text-sm text-senses-text-2 hover:text-senses-text hover:bg-senses-surface-2 transition-colors duration-[var(--duration-base)]">
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
              <a
                href="/hearing"
                className="px-3 py-1.5 text-sm hearing-accent hover:text-senses-accent transition-colors duration-[var(--duration-base)] rounded-lg hover:bg-senses-surface flex items-center gap-1"
              >
                Hearing
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                  <path d="M8 11L2 5h12z"/>
                </svg>
              </a>
              {hearingOpen && (
                <div className="absolute top-full left-0 mt-1 bg-senses-surface border border-senses-border rounded-xl shadow-2xl py-1 min-w-[160px] animate-fade-in">
                  {hearingLinks.map(l => (
                    <a key={l.href} href={l.href}
                      className="block px-4 py-2 text-sm text-senses-text-2 hover:text-senses-text hover:bg-senses-surface-2 transition-colors duration-[var(--duration-base)]">
                      {l.label}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <a href="/collections" className="px-3 py-1.5 text-sm text-senses-text-2 hover:text-senses-text transition-colors duration-[var(--duration-base)] rounded-lg hover:bg-senses-surface">
              Collections
            </a>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Search button */}
            <button
              onClick={openSearch}
              aria-label="Search (Ctrl+K)"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-senses-surface border border-senses-border
                         text-senses-text-2 hover:text-senses-text hover:border-senses-border-2
                         transition-all duration-[var(--duration-base)] text-sm"
            >
              <SearchIcon />
              <span className="hidden sm:inline text-xs">Search</span>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 text-[10px] text-senses-text-3 font-mono">
                <span>⌘</span><span>K</span>
              </kbd>
            </button>

            {/* My Senses */}
            <a
              href="/my-senses"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                         bg-senses-surface border border-senses-border text-senses-text-2
                         hover:text-senses-text hover:border-senses-border-2 text-sm
                         transition-all duration-[var(--duration-base)]"
            >
              My Senses
            </a>

            {/* Mobile menu toggle */}
            <button
              onClick={toggleMobileNav}
              aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
              className="md:hidden p-2 rounded-lg text-senses-text-2 hover:text-senses-text hover:bg-senses-surface transition-colors duration-[var(--duration-base)]"
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
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="absolute top-[var(--nav-height)] left-0 right-0 bg-senses-bg border-b border-senses-border
                       p-4 animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col gap-1">
              <a href="/explore"    onClick={closeMobileNav} className="px-4 py-3 text-senses-text-2 hover:text-senses-text hover:bg-senses-surface rounded-lg transition-colors">Explore</a>
              <a href="/discover"   onClick={closeMobileNav} className="px-4 py-3 text-senses-text-2 hover:text-senses-text hover:bg-senses-surface rounded-lg transition-colors">Discover</a>
              <div className="border-t border-senses-border my-2" />
              <p className="px-4 text-[10px] tracking-widest text-senses-text-3 uppercase mb-1">Sight</p>
              {sightLinks.map(l => (
                <a key={l.href} href={l.href} onClick={closeMobileNav} className="px-4 py-2 text-senses-text-2 hover:text-senses-text hover:bg-senses-surface rounded-lg transition-colors">{l.label}</a>
              ))}
              <div className="border-t border-senses-border my-2" />
              <p className="px-4 text-[10px] tracking-widest text-senses-text-3 uppercase mb-1">Hearing</p>
              {hearingLinks.map(l => (
                <a key={l.href} href={l.href} onClick={closeMobileNav} className="px-4 py-2 text-senses-text-2 hover:text-senses-text hover:bg-senses-surface rounded-lg transition-colors">{l.label}</a>
              ))}
              <div className="border-t border-senses-border my-2" />
              <a href="/collections" onClick={closeMobileNav} className="px-4 py-3 text-senses-text-2 hover:text-senses-text hover:bg-senses-surface rounded-lg transition-colors">Collections</a>
              <a href="/my-senses"   onClick={closeMobileNav} className="px-4 py-3 text-senses-text-2 hover:text-senses-text hover:bg-senses-surface rounded-lg transition-colors">My Senses</a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
