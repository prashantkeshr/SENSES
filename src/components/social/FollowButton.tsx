import { useState, useEffect } from 'react';
import { toggleFollow, getLocalState } from '@/lib/utils/localState';

interface Props {
  creatorId:    string;
  displayName?: string;
  size?:        'sm' | 'md';
}

export function FollowButton({ creatorId, displayName, size = 'md' }: Props) {
  const [following, setFollowing] = useState(false);
  const [mounted,   setMounted]   = useState(false);
  const [pulse,     setPulse]     = useState(false);

  useEffect(() => {
    const state = getLocalState();
    setFollowing(state.followedCreatorIds.includes(creatorId));
    setMounted(true);
  }, [creatorId]);

  const handleClick = () => {
    const nowFollowing = toggleFollow(creatorId);
    setFollowing(nowFollowing);
    if (nowFollowing) {
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
    }
  };

  if (!mounted) return null;

  const padX  = size === 'sm' ? 'px-3'   : 'px-5';
  const padY  = size === 'sm' ? 'py-1.5' : 'py-2.5';
  const text  = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <button
      onClick={handleClick}
      aria-label={following ? `Unfollow ${displayName ?? 'creator'}` : `Follow ${displayName ?? 'creator'}`}
      className={`relative rounded-xl font-medium transition-all duration-200 select-none
        ${padX} ${padY} ${text}
        ${pulse ? 'scale-105' : ''}
        ${following
          ? 'bg-senses-surface-2 border border-senses-border text-senses-text-3 hover:border-red-500/30 hover:text-red-400'
          : 'bg-senses-text text-senses-bg hover:bg-senses-accent'
        }`}
    >
      {following ? 'Following' : 'Follow'}
    </button>
  );
}
