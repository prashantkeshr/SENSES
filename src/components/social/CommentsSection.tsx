import { useState, useEffect, useRef } from 'react';
import { getComments, addComment, deleteComment, type Comment } from '@/lib/utils/comments';
import { formatDate } from '@/lib/utils/formatters';

interface Props {
  mediaId:   string;
  division?: 'sight' | 'hearing';
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
    </svg>
  );
}

export function CommentsSection({ mediaId, division = 'sight' }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text,     setText]     = useState('');
  const [mounted,  setMounted]  = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const accentColor = division === 'hearing' ? 'text-senses-hearing' : 'text-senses-sight';
  const borderActive = division === 'hearing' ? 'focus:border-senses-hearing/40' : 'focus:border-senses-sight/40';

  useEffect(() => {
    setComments(getComments(mediaId));
    setMounted(true);
  }, [mediaId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const comment = addComment(mediaId, text);
    setComments(prev => [comment, ...prev]);
    setText('');
    textareaRef.current?.focus();
  };

  const handleDelete = (commentId: string) => {
    deleteComment(mediaId, commentId);
    setComments(prev => prev.filter(c => c.id !== commentId));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  if (!mounted) return null;

  return (
    <section className="border-t border-senses-border pt-8">
      <h2 className="text-senses-text-3 text-xs tracking-widest uppercase mb-5 font-medium">
        Notes &amp; Comments
        {comments.length > 0 && (
          <span className={`ml-2 ${accentColor}`}>{comments.length}</span>
        )}
      </h2>

      {/* Input */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className={`relative rounded-xl border border-senses-border bg-senses-surface transition-colors ${borderActive}`}>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a note or comment… (Ctrl+Enter to submit)"
            rows={3}
            className="w-full bg-transparent px-4 pt-3 pb-10 text-senses-text text-sm placeholder:text-senses-text-3 outline-none resize-none rounded-xl"
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <span className="text-senses-text-3 text-[10px]">{text.length}/500</span>
            <button
              type="submit"
              disabled={!text.trim() || text.length > 500}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed
                ${division === 'hearing'
                  ? 'bg-senses-hearing/15 text-senses-hearing hover:bg-senses-hearing/25 border border-senses-hearing/20'
                  : 'bg-senses-sight/15 text-senses-sight hover:bg-senses-sight/25 border border-senses-sight/20'}`}
            >
              <SendIcon />
              Post
            </button>
          </div>
        </div>
        <p className="mt-1.5 text-senses-text-3 text-[10px]">
          Comments are stored locally on your device — only you can see them.
        </p>
      </form>

      {/* Comment list */}
      {comments.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-senses-text-3 text-sm">No notes yet. Be the first to leave one.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {comments.map(c => (
            <li
              key={c.id}
              className="group flex gap-3 p-3.5 rounded-xl bg-senses-surface border border-senses-border"
            >
              {/* Avatar placeholder */}
              <div className="w-7 h-7 rounded-full bg-senses-surface-2 border border-senses-border flex-shrink-0 flex items-center justify-center mt-0.5">
                <span className="text-senses-text-3 text-[10px] font-medium">You</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-senses-text text-xs font-medium">You</span>
                  <span className="text-senses-text-3 text-[10px]">{formatDate(c.createdAt)}</span>
                </div>
                <p className="text-senses-text-2 text-sm leading-relaxed whitespace-pre-wrap break-words">{c.text}</p>
              </div>

              <button
                onClick={() => handleDelete(c.id)}
                aria-label="Delete comment"
                className="self-start mt-0.5 text-senses-text-3 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1 rounded flex-shrink-0"
              >
                <TrashIcon />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
