import type { FeatureStatus } from '@/types/index';

interface StatusBadgeProps {
  status: FeatureStatus;
  className?: string;
}

const labels: Record<FeatureStatus, string> = {
  'available':    'Available',
  'local':        'Local',
  'preview':      'Preview',
  'coming-soon':  'Coming Soon',
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const cls = {
    'available':   'badge-available',
    'local':       'badge-local',
    'preview':     'badge-preview',
    'coming-soon': 'badge-coming-soon',
  }[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium tracking-wider uppercase border ${cls} ${className}`}>
      {labels[status]}
    </span>
  );
}

interface TypeBadgeProps {
  type: string;
  division: 'sight' | 'hearing';
  className?: string;
}

export function TypeBadge({ type, division, className = '' }: TypeBadgeProps) {
  const color = division === 'sight'
    ? 'text-[#C8B89A] bg-[#C8B89A]/10 border-[#C8B89A]/20'
    : 'text-[#8FAEC0] bg-[#8FAEC0]/10 border-[#8FAEC0]/20';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium tracking-widest uppercase border ${color} ${className}`}>
      {type}
    </span>
  );
}
