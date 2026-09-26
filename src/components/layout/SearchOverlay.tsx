import { useState, useEffect, useRef, useCallback } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { provider } from '@lib/providers/index';
import type { Media } from '@/types/index';
import { TypeBadge } from '@components/ui/Badge';
import { addSearchHistory, getLocalState } from '@lib/utils/localState';
import { mediaTypeLabel } from '@lib/utils/formatters';

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

export default function SearchOverlay() {
  const { searchOpen, closeSearch } = useUIStore();
  const [query, setQuery]           = useState('');
  const [results, setResults]       = useState<Media[]>([]);
  const [loading, setLoading]       = useState(false);
  const inputRef                    = useRef<HTMLInputElement>(null);
  const timerRef                    = useRef<ReturnType<typeof setTimeout> | null>(null);

  const state = getLocalState();
  const recentSearches = state.searchHistory.slice(0, 5);

  useEffect(() => {
    if (searchOpen) {
      setQuery('');
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSearch();
    };
    if (searchOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [searchOpen, closeSearch]);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    const result = await provider.searchMedia(q, { limit: 8 });
    setResults(result.items);
    setLoading(false);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSearch(q), 250);
  };

  const handleSelect = (term: string) => {
    addSearchHistory(term);
    closeSearch();
    window.location.href = `/search?q=${encodeURIComponent(term)}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) handleSelect(query.trim());
  };

  const mediaHref = (m: Media) =>
    m.division === 'hearing'
      ? `/hearing/${m.type}/${m.slug}`
      : `/sight/${m.type}/${m.slug}`;

  if (!searchOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={closeSearch}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl mx-auto mt-[10vh] px-4">
        <div className="bg-senses-surface border border-senses-border rounded-2xl overflow-hidden shadow-2xl animate-scale-in">

          {/* Search input */}
          <form onSubmit={handleSubmit} className="flex items-center gap-3 px-4 py-3.5 border-b border-senses-border">
            <span className="text-senses-text-3"><SearchIcon /></span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleChange}
              placeholder="Search photos, sounds, music, creators..."
              className="flex-1 bg-transparent text-senses-text text-sm placeholder:text-senses-text-3 outline-none"
              autoComplete="off"
              spellCheck="false"
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }}
                className="text-senses-text-3 hover:text-senses-text transition-colors"
                aria-label="Clear"
              >
                <CloseIcon />
              </button>
            )}
          </form>

          {/* Results / recent */}
          <div className="max-h-[60vh] overflow-y-auto">
            {loading && (
              <div className="px-4 py-8 text-center text-senses-text-3 text-sm">Searching...</div>
            )}

            {!loading && !query && recentSearches.length > 0 && (
              <div className="py-2">
                <p className="px-4 py-2 text-[10px] tracking-widest text-senses-text-3 uppercase">Recent</p>
                {recentSearches.map(term => (
                  <button
                    key={term}
                    onClick={() => handleSelect(term)}
                    className="w-full text-left px-4 py-2.5 text-sm text-senses-text-2 hover:bg-senses-surface-2 hover:text-senses-text transition-colors flex items-center gap-3"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5 text-senses-text-3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    {term}
                  </button>
                ))}
              </div>
            )}

            {!loading && !query && recentSearches.length === 0 && (
              <div className="px-4 py-8 text-center">
                <p className="text-senses-text-3 text-sm mb-4">Discover visual and audio media</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['mountains', 'rain', 'lo-fi music', 'ocean', 'minimal', 'night city'].map(term => (
                    <button
                      key={term}
                      onClick={() => handleSelect(term)}
                      className="px-3 py-1.5 rounded-full bg-senses-surface-2 border border-senses-border text-senses-text-3 hover:text-senses-text text-xs transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="py-2">
                <p className="px-4 py-2 text-[10px] tracking-widest text-senses-text-3 uppercase">Results for "{query}"</p>
                {results.map(m => {
                  const imgData = m.data as { thumbnailUrl?: string; artworkUrl?: string };
                  const thumb = imgData.thumbnailUrl ?? imgData.artworkUrl ?? '';
                  return (
                    <a
                      key={m.id}
                      href={mediaHref(m)}
                      onClick={() => { addSearchHistory(query); closeSearch(); }}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-senses-surface-2 transition-colors group"
                    >
                      {thumb && (
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-senses-surface-2">
                          <img src={thumb} alt="" className="w-full h-full object-cover" loading="lazy" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-senses-text text-sm truncate">{m.title}</p>
                        <p className="text-senses-text-3 text-xs truncate">{m.category}</p>
                      </div>
                      <TypeBadge type={mediaTypeLabel(m.type)} division={m.division} />
                    </a>
                  );
                })}
                <div className="px-4 pb-3 pt-1">
                  <button
                    onClick={() => handleSelect(query)}
                    className="text-sm text-senses-text-3 hover:text-senses-text transition-colors"
                  >
                    See all results for "{query}" →
                  </button>
                </div>
              </div>
            )}

            {!loading && query && results.length === 0 && (
              <div className="px-4 py-8 text-center text-senses-text-3 text-sm">
                No results for "{query}". Try a different term.
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-senses-border flex items-center gap-4 text-[10px] text-senses-text-3">
            <span><kbd className="font-mono">↵</kbd> select</span>
            <span><kbd className="font-mono">↑↓</kbd> navigate</span>
            <span><kbd className="font-mono">Esc</kbd> close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
