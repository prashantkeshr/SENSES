import { useState, useEffect, useMemo } from 'react';
import type { Media, Creator } from '@/types/index';
import { getLocalState, toggleFollow, clearLocalData } from '@/lib/utils/localState';
import { getAllCommentCount } from '@/lib/utils/comments';
import { getTopInterests, getRecentlyViewed } from '@/lib/utils/recommendations';
import { getDownloadHistory, getDownloadCount } from '@/lib/utils/downloads';
import {
  getUserCollections, createUserCollection, deleteUserCollection,
  addToUserCollection, removeFromUserCollection, type UserCollection,
} from '@/lib/utils/userCollections';
import { MediaCard } from '@/components/media/MediaCard';
import { formatCount, formatDate } from '@/lib/utils/formatters';

interface Props {
  media:    Media[];
  creators: Creator[];
}

type Tab = 'liked' | 'saved' | 'following' | 'collections' | 'interests' | 'downloads';

function EmptyState({ tab }: { tab: Tab }) {
  const msgs: Record<Tab, { heading: string; body: string; href?: string; cta?: string }> = {
    liked:       { heading: 'Nothing liked yet',        body: 'Heart items while browsing to find them here.',          href: '/explore',  cta: 'Explore media' },
    saved:       { heading: 'Nothing saved yet',        body: 'Save items to bookmark them for later.',                 href: '/explore',  cta: 'Explore media' },
    following:   { heading: 'Not following anyone',     body: 'Follow creators to see their work in one place.',        href: '/discover', cta: 'Discover creators' },
    collections: { heading: 'No collections yet',       body: 'Create a collection to organise your saved media.',      href: undefined,   cta: undefined },
    interests:   { heading: 'No interests tracked yet', body: 'Browse and view media to build your interest profile.',  href: '/explore',  cta: 'Start exploring' },
    downloads:   { heading: 'No downloads yet',         body: 'Download media from any detail page to track it here.',  href: '/explore',  cta: 'Browse media' },
  };
  const m = msgs[tab];
  return (
    <div className="py-20 text-center">
      <p className="text-senses-text-2 text-base mb-2">{m.heading}</p>
      <p className="text-senses-text-3 text-sm mb-6">{m.body}</p>
      {m.href && (
        <a href={m.href} className="px-5 py-2.5 rounded-xl bg-senses-surface border border-senses-border text-senses-text-2 text-sm hover:border-senses-border-2 transition-all">
          {m.cta}
        </a>
      )}
    </div>
  );
}

function CollectionCard({
  col, media, creators, onDelete,
}: {
  col: UserCollection;
  media: Media[];
  creators: Creator[];
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const creatorMap = useMemo(() => Object.fromEntries(creators.map(c => [c.id, c])), [creators]);
  const items = col.mediaIds.map(id => media.find(m => m.id === id)).filter(Boolean) as Media[];
  const covers = items.slice(0, 4);

  return (
    <div className="rounded-2xl bg-senses-surface border border-senses-border overflow-hidden">
      {/* Mosaic cover */}
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left">
        <div className="relative h-36 bg-senses-surface-2 overflow-hidden grid grid-cols-2 grid-rows-2 gap-0.5">
          {covers.length === 0 && (
            <div className="col-span-2 row-span-2 flex items-center justify-center">
              <span className="text-senses-text-3 text-xs">Empty</span>
            </div>
          )}
          {covers.map((m, idx) => (
            <div key={m.id} className={`overflow-hidden ${covers.length === 1 ? 'col-span-2 row-span-2' : covers.length === 2 ? 'row-span-2' : ''}`}>
              <img src={m.thumbnail} alt="" className="w-full h-full object-cover opacity-70" />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-senses-bg/60 to-transparent" />
        </div>

        <div className="p-4 flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-senses-text text-sm font-medium leading-tight truncate">{col.name}</p>
            <p className="text-senses-text-3 text-xs mt-0.5">{col.mediaIds.length} items · {formatDate(col.createdAt)}</p>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={`w-4 h-4 flex-shrink-0 ml-2 mt-0.5 text-senses-text-3 transition-transform ${expanded ? 'rotate-180' : ''}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </button>

      {/* Expanded items */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-senses-border pt-4">
          {items.length === 0 ? (
            <p className="text-senses-text-3 text-sm">No items in this collection yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
              {items.map(item => (
                <div key={item.id} className="relative group">
                  <a href={item.division === 'hearing' ? `/hearing/${item.type}/${item.slug}` : `/sight/${item.type}/${item.slug}`}>
                    <img src={item.thumbnail} alt={item.title} className="w-full aspect-square object-cover rounded-lg" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded-lg transition-all" />
                  </a>
                  <button
                    onClick={() => removeFromUserCollection(col.id, item.id)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all hover:text-red-400"
                    aria-label="Remove from collection"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => onDelete(col.id)}
            className="text-senses-text-3 hover:text-red-400 text-xs transition-colors"
          >
            Delete collection
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function MySensesPage({ media, creators }: Props) {
  const [tab,         setTab]         = useState<Tab>('liked');
  const [likedIds,    setLikedIds]    = useState<string[]>([]);
  const [savedIds,    setSavedIds]    = useState<string[]>([]);
  const [followedIds, setFollowedIds] = useState<string[]>([]);
  const [commentCount,  setCommentCount]  = useState(0);
  const [userCols,      setUserCols]      = useState<UserCollection[]>([]);
  const [newColName,    setNewColName]    = useState('');
  const [showNewCol,    setShowNewCol]    = useState(false);
  const [interests,      setInterests]     = useState<{ label: string; count: number }[]>([]);
  const [recentItems,    setRecentItems]   = useState<Media[]>([]);
  const [downloadItems,  setDownloadItems] = useState<Media[]>([]);
  const [downloadCount,  setDownloadCount] = useState(0);
  const [mounted,        setMounted]       = useState(false);

  const creatorMap = useMemo(() => Object.fromEntries(creators.map(c => [c.id, c])), [creators]);
  const mediaMap   = useMemo(() => Object.fromEntries(media.map(m  => [m.id,  m])),  [media]);

  useEffect(() => {
    const state = getLocalState();
    setLikedIds(state.likedMediaIds);
    setSavedIds(state.savedMediaIds);
    setFollowedIds(state.followedCreatorIds);
    setCommentCount(getAllCommentCount());
    setUserCols(getUserCollections());
    setInterests(getTopInterests(state.interestSignals, 15));
    setRecentItems(getRecentlyViewed(media, state.recentlyViewedIds, 10));
    setDownloadItems(getDownloadHistory(media));
    setDownloadCount(getDownloadCount());
    setMounted(true);
  }, []);

  const likedMedia   = useMemo(() => likedIds.map(id => mediaMap[id]).filter(Boolean) as Media[], [likedIds, mediaMap]);
  const savedMedia   = useMemo(() => savedIds.map(id => mediaMap[id]).filter(Boolean) as Media[], [savedIds, mediaMap]);
  const followedCrs  = useMemo(() => followedIds.map(id => creatorMap[id]).filter(Boolean) as Creator[], [followedIds, creatorMap]);

  const handleUnfollow = (id: string) => {
    toggleFollow(id);
    setFollowedIds(prev => prev.filter(f => f !== id));
  };

  const handleCreateCol = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    const col = createUserCollection(newColName);
    setUserCols(prev => [...prev, col]);
    setNewColName('');
    setShowNewCol(false);
  };

  const handleDeleteCol = (id: string) => {
    deleteUserCollection(id);
    setUserCols(prev => prev.filter(c => c.id !== id));
  };

  const TABS: { key: Tab; label: string; count: number }[] = [
    { key: 'liked',       label: 'Liked',       count: likedIds.length     },
    { key: 'saved',       label: 'Saved',        count: savedIds.length     },
    { key: 'following',   label: 'Following',    count: followedIds.length  },
    { key: 'collections', label: 'Collections',  count: userCols.length     },
    { key: 'interests',   label: 'Interests',    count: interests.length    },
    { key: 'downloads',  label: 'Downloads',    count: downloadCount       },
  ];

  if (!mounted) {
    return (
      <div className="py-32 text-center text-senses-text-3 text-sm">Loading your activity…</div>
    );
  }

  const totalActivity = likedIds.length + savedIds.length + followedIds.length + commentCount;

  return (
    <div>
      {/* ── Activity summary ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 p-5 rounded-2xl bg-senses-surface border border-senses-border">
        {[
          ['Liked',      likedIds.length,    'text-red-400'          ],
          ['Saved',      savedIds.length,    'text-senses-sight'     ],
          ['Following',  followedIds.length, 'text-senses-hearing'   ],
          ['Comments',   commentCount,       'text-senses-text-2'    ],
        ].map(([label, count, cls]) => (
          <div key={label as string} className="text-center">
            <p className={`text-2xl font-light ${cls}`}>{count as number}</p>
            <p className="text-senses-text-3 text-[10px] uppercase tracking-wider mt-0.5">{label as string}</p>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 mb-8 border-b border-senses-border">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-all relative ${
              tab === t.key
                ? 'text-senses-text'
                : 'text-senses-text-3 hover:text-senses-text-2'
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`ml-1.5 text-[10px] ${tab === t.key ? 'text-senses-accent' : 'text-senses-text-3'}`}>
                {t.count}
              </span>
            )}
            {tab === t.key && (
              <span className="absolute bottom-0 left-0 right-0 h-px bg-senses-text rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* ── Liked ── */}
      {tab === 'liked' && (
        likedMedia.length === 0
          ? <EmptyState tab="liked" />
          : <div className="masonry-grid">
              {likedMedia.map(m => (
                <MediaCard key={m.id} media={m} creator={creatorMap[m.creator]} />
              ))}
            </div>
      )}

      {/* ── Saved ── */}
      {tab === 'saved' && (
        savedMedia.length === 0
          ? <EmptyState tab="saved" />
          : <div className="masonry-grid">
              {savedMedia.map(m => (
                <MediaCard key={m.id} media={m} creator={creatorMap[m.creator]} />
              ))}
            </div>
      )}

      {/* ── Following ── */}
      {tab === 'following' && (
        followedCrs.length === 0
          ? <EmptyState tab="following" />
          : <div className="space-y-3">
              {followedCrs.map(c => (
                <div key={c.id} className="flex items-center gap-4 p-4 rounded-xl bg-senses-surface border border-senses-border">
                  <a href={`/creator/${c.id}`} className="flex-shrink-0">
                    <img src={c.avatar} alt={c.displayName} className="w-12 h-12 rounded-xl object-cover border border-senses-border" />
                  </a>
                  <div className="flex-1 min-w-0">
                    <a href={`/creator/${c.id}`} className="block">
                      <p className="text-senses-text text-sm font-medium hover:text-senses-accent transition-colors">{c.displayName}</p>
                      <p className="text-senses-text-3 text-xs">@{c.username}</p>
                    </a>
                    <div className="flex gap-3 mt-1">
                      <span className="text-senses-text-3 text-[10px]">{formatCount(c.stats.mediaCount)} items</span>
                      <span className="text-senses-text-3 text-[10px]">{c.location ?? ''}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnfollow(c.id)}
                    className="px-3 py-1.5 rounded-lg text-xs bg-senses-surface-2 border border-senses-border text-senses-text-3 hover:border-red-500/30 hover:text-red-400 transition-all flex-shrink-0"
                  >
                    Unfollow
                  </button>
                </div>
              ))}
            </div>
      )}

      {/* ── Collections ── */}
      {tab === 'collections' && (
        <div>
          {/* Create new */}
          <div className="mb-6">
            {showNewCol ? (
              <form onSubmit={handleCreateCol} className="flex gap-2">
                <input
                  type="text"
                  value={newColName}
                  onChange={e => setNewColName(e.target.value)}
                  placeholder="Collection name…"
                  autoFocus
                  maxLength={60}
                  className="flex-1 bg-senses-surface border border-senses-border rounded-xl px-4 py-2.5 text-senses-text text-sm placeholder:text-senses-text-3 outline-none focus:border-senses-border-2 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!newColName.trim()}
                  className="px-4 py-2.5 rounded-xl bg-senses-text text-senses-bg text-sm font-medium hover:bg-senses-accent transition-colors disabled:opacity-40"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => { setShowNewCol(false); setNewColName(''); }}
                  className="px-4 py-2.5 rounded-xl bg-senses-surface border border-senses-border text-senses-text-3 text-sm hover:text-senses-text transition-colors"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <button
                onClick={() => setShowNewCol(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-senses-surface border border-senses-border text-senses-text-2 text-sm hover:border-senses-border-2 transition-all"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                New collection
              </button>
            )}
          </div>

          {userCols.length === 0 && !showNewCol
            ? <EmptyState tab="collections" />
            : <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {userCols.map(col => (
                  <CollectionCard
                    key={col.id}
                    col={col}
                    media={media}
                    creators={creators}
                    onDelete={handleDeleteCol}
                  />
                ))}
              </div>
          }
        </div>
      )}

      {/* ── Interests ── */}
      {tab === 'interests' && (
        interests.length === 0
          ? (
            <div className="py-20 text-center">
              <p className="text-senses-text-2 text-base mb-2">No interests tracked yet</p>
              <p className="text-senses-text-3 text-sm mb-6">Browse and view media to build your interest profile.</p>
              <a href="/explore" className="px-5 py-2.5 rounded-xl bg-senses-surface border border-senses-border text-senses-text-2 text-sm hover:border-senses-border-2 transition-all">
                Start exploring
              </a>
            </div>
          ) : (
            <div>
              <p className="text-senses-text-3 text-sm mb-6">
                Built from your views, likes, and saves. Stronger signals drive personalized picks on the home page.
              </p>

              {/* Top interests bar chart */}
              <div className="space-y-2 mb-10">
                {(() => {
                  const max = interests[0]?.count ?? 1;
                  return interests.map(({ label, count }) => (
                    <div key={label} className="flex items-center gap-3">
                      <span className="text-senses-text-2 text-sm w-32 truncate flex-shrink-0 capitalize">{label}</span>
                      <div className="flex-1 h-2 bg-senses-surface-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-senses-accent transition-all duration-500"
                          style={{ width: `${Math.round((count / max) * 100)}%` }}
                        />
                      </div>
                      <span className="text-senses-text-3 text-xs w-6 text-right flex-shrink-0">{count}</span>
                    </div>
                  ));
                })()}
              </div>

              {/* Recently viewed shelf */}
              {recentItems.length > 0 && (
                <div>
                  <h3 className="text-senses-text-3 text-xs uppercase tracking-widest font-medium mb-4">
                    Recently Viewed
                  </h3>
                  <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                    {recentItems.map(m => {
                      const href = m.division === 'hearing'
                        ? `/hearing/${m.type}/${m.slug}`
                        : `/sight/${m.type}/${m.slug}`;
                      return (
                        <a key={m.id} href={href} className="flex-shrink-0 group" style={{ width: '120px' }}>
                          <div className="w-full aspect-square rounded-xl overflow-hidden bg-senses-surface-2 mb-2">
                            <img src={m.thumbnail} alt={m.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </div>
                          <p className="text-senses-text-2 text-xs line-clamp-2 group-hover:text-senses-text transition-colors">{m.title}</p>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )
      )}

      {/* ── Downloads ── */}
      {tab === 'downloads' && (
        downloadItems.length === 0
          ? <EmptyState tab="downloads" />
          : (
            <div>
              <p className="text-senses-text-3 text-sm mb-6">
                Media you've downloaded through SENSES, most recent first.
              </p>
              <div className="masonry-grid">
                {downloadItems.filter(m => m.division === 'sight').map(m => (
                  <MediaCard key={m.id} media={m} creator={creatorMap[m.creator]} />
                ))}
              </div>
              {downloadItems.filter(m => m.division === 'hearing').length > 0 && (
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {downloadItems.filter(m => m.division === 'hearing').map(m => (
                    <MediaCard key={m.id} media={m} creator={creatorMap[m.creator]} layout="grid" />
                  ))}
                </div>
              )}
            </div>
          )
      )}

      {/* ── Danger zone ── */}
      {totalActivity > 0 && (
        <div className="mt-20 pt-8 border-t border-senses-border">
          <p className="text-senses-text-3 text-xs tracking-widest uppercase mb-3 font-medium">Data</p>
          <p className="text-senses-text-3 text-sm mb-4">
            All your activity is stored locally on this device. Clearing it is permanent.
          </p>
          <button
            onClick={() => {
              if (confirm('Clear all local activity? This cannot be undone.')) {
                clearLocalData();
                setLikedIds([]);
                setSavedIds([]);
                setFollowedIds([]);
              }
            }}
            className="px-4 py-2 rounded-lg text-xs bg-transparent border border-red-500/20 text-red-400/60 hover:border-red-500/40 hover:text-red-400 transition-all"
          >
            Clear all local data
          </button>
        </div>
      )}
    </div>
  );
}
