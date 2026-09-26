export function formatDuration(seconds: number): string {
  if (seconds >= 3600) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  }
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function slugToTitle(slug: string): string {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export function mediaTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    photo:         'Photo',
    video:         'Video',
    illustration:  'Illustration',
    vector:        'Vector',
    gif:           'GIF',
    '3d':          '3D',
    music:         'Music',
    sound:         'Sound',
    ambient:       'Ambient',
    loop:          'Loop',
  };
  return labels[type] ?? type;
}

export function divisionLabel(division: string): string {
  return division === 'sight' ? 'SIGHT' : 'HEARING';
}
