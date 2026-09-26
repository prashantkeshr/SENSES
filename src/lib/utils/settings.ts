export type ThemeMode  = 'dark' | 'light' | 'system';
export type AccentKey  = 'red' | 'blue' | 'amber' | 'green' | 'purple' | 'cream';
export type DensityKey = 'comfortable' | 'compact';

export interface SensesSettings {
  theme:             ThemeMode;
  accent:            AccentKey;
  density:           DensityKey;
  showMoodStrip:     boolean;
  showStyleStrip:    boolean;
  showForYou:        boolean;
  showRecentlyViewed:boolean;
  downloadFormat:    'original' | 'preview';
  autoplayDiscovery: boolean;
}

export const ACCENT_COLORS: Record<AccentKey, { hex: string; label: string }> = {
  red:    { hex: '#FF2D55', label: 'Neon Red'    },
  blue:   { hex: '#00B8FF', label: 'Electric Blue' },
  amber:  { hex: '#FFB800', label: 'Neon Amber'  },
  green:  { hex: '#00E676', label: 'Neon Green'  },
  purple: { hex: '#BF5FFF', label: 'Electric Purple' },
  cream:  { hex: '#E8E4DC', label: 'Classic Cream' },
};

const KEY = 'senses:settings';

const DEFAULTS: SensesSettings = {
  theme:             'dark',
  accent:            'red',
  density:           'comfortable',
  showMoodStrip:     true,
  showStyleStrip:    true,
  showForYou:        true,
  showRecentlyViewed:true,
  downloadFormat:    'original',
  autoplayDiscovery: false,
};

export function getSettings(): SensesSettings {
  if (typeof window === 'undefined') return { ...DEFAULTS };
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  } catch { return { ...DEFAULTS }; }
}

export function saveSettings(patch: Partial<SensesSettings>): SensesSettings {
  const current = getSettings();
  const next = { ...current, ...patch };
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* noop */ }
  applySettings(next);
  return next;
}

export function resolveTheme(mode: ThemeMode): 'dark' | 'light' {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode;
}

export function applySettings(s: SensesSettings): void {
  if (typeof window === 'undefined') return;
  const html  = document.documentElement;
  const theme = resolveTheme(s.theme);
  html.setAttribute('data-theme', theme);
  html.setAttribute('data-accent', s.accent);
  html.setAttribute('data-density', s.density);
  if (theme === 'dark') {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
  // Apply dynamic accent CSS variable
  const color = ACCENT_COLORS[s.accent]?.hex ?? ACCENT_COLORS.red.hex;
  html.style.setProperty('--color-accent', color);
}
