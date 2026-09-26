import { useState, useEffect, useRef } from 'react';
import {
  getUserCollections, createUserCollection,
  addToUserCollection, removeFromUserCollection,
  getCollectionsContaining,
  type UserCollection,
} from '@/lib/utils/userCollections';

interface Props {
  mediaId:  string;
  onClose:  () => void;
}

export function SaveToCollectionModal({ mediaId, onClose }: Props) {
  const [cols,        setCols]        = useState<UserCollection[]>([]);
  const [containing,  setContaining]  = useState<Set<string>>(new Set());
  const [newName,     setNewName]     = useState('');
  const [showNew,     setShowNew]     = useState(false);
  const inputRef                      = useRef<HTMLInputElement>(null);
  const backdropRef                   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const all      = getUserCollections();
    const inCol    = getCollectionsContaining(mediaId);
    setCols(all);
    setContaining(new Set(inCol.map(c => c.id)));
  }, [mediaId]);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (e.target === backdropRef.current) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    if (showNew) inputRef.current?.focus();
  }, [showNew]);

  const toggle = (colId: string) => {
    if (containing.has(colId)) {
      removeFromUserCollection(colId, mediaId);
      setContaining(prev => { const s = new Set(prev); s.delete(colId); return s; });
    } else {
      addToUserCollection(colId, mediaId);
      setContaining(prev => new Set([...prev, colId]));
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const col = createUserCollection(newName);
    addToUserCollection(col.id, mediaId);
    setCols(prev => [...prev, col]);
    setContaining(prev => new Set([...prev, col.id]));
    setNewName('');
    setShowNew(false);
  };

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Save to collection"
    >
      <div className="w-full max-w-sm bg-senses-bg border border-senses-border rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-senses-border">
          <h2 className="text-senses-text text-sm font-medium">Save to Collection</h2>
          <button onClick={onClose} className="text-senses-text-3 hover:text-senses-text transition-colors p-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-2 max-h-72 overflow-y-auto">
          {cols.length === 0 && !showNew && (
            <p className="text-senses-text-3 text-sm text-center py-4">No collections yet.</p>
          )}
          {cols.map(col => {
            const inCol = containing.has(col.id);
            return (
              <button
                key={col.id}
                onClick={() => toggle(col.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all border ${
                  inCol
                    ? 'bg-senses-accent/10 border-senses-accent/30 text-senses-text'
                    : 'bg-senses-surface border-senses-border text-senses-text-2 hover:border-senses-border-2'
                }`}
              >
                <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all ${
                  inCol ? 'bg-senses-accent border-senses-accent' : 'border-senses-border'
                }`}>
                  {inCol && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-2.5 h-2.5 text-senses-bg">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{col.name}</p>
                  <p className="text-senses-text-3 text-[10px]">{col.mediaIds.length} items</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* New collection */}
        <div className="px-4 pb-4">
          {showNew ? (
            <form onSubmit={handleCreate} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Collection name…"
                maxLength={60}
                className="flex-1 bg-senses-surface border border-senses-border rounded-xl px-3 py-2 text-senses-text text-sm placeholder:text-senses-text-3 outline-none focus:border-senses-border-2"
              />
              <button
                type="submit"
                disabled={!newName.trim()}
                className="px-3 py-2 rounded-xl bg-senses-text text-senses-bg text-xs font-medium hover:bg-senses-accent transition-colors disabled:opacity-40"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => { setShowNew(false); setNewName(''); }}
                className="px-3 py-2 rounded-xl bg-senses-surface border border-senses-border text-senses-text-3 text-xs"
              >
                ×
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowNew(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-senses-surface border border-senses-border text-senses-text-3 text-sm hover:border-senses-border-2 hover:text-senses-text-2 transition-all"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
              </svg>
              New collection
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
