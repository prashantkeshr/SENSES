import { useState, useEffect } from 'react';
import { getSettings, saveSettings, applySettings, ACCENT_COLORS } from '@/lib/utils/settings';
import type { SensesSettings, ThemeMode, AccentKey, DensityKey } from '@/lib/utils/settings';
import { toast } from '@/lib/utils/toast';

// ─── Mini theme preview SVG ───────────────────────────────────────────────────
function ThemePreview({ mode }: { mode: ThemeMode }) {
  if (mode === 'dark') return (
    <svg viewBox="0 0 80 52" className="w-full h-full rounded-md">
      <rect width="80" height="52" fill="#0C0C0C"/>
      <rect x="6" y="6" width="68" height="10" rx="3" fill="#181818"/>
      <rect x="6" y="22" width="42" height="24" rx="3" fill="#151515"/>
      <rect x="52" y="22" width="22" height="24" rx="3" fill="#151515"/>
      <rect x="10" y="27" width="24" height="3" rx="1" fill="#333"/>
      <rect x="10" y="32" width="16" height="2" rx="1" fill="#252525"/>
    </svg>
  );
  if (mode === 'light') return (
    <svg viewBox="0 0 80 52" className="w-full h-full rounded-md">
      <rect width="80" height="52" fill="#F8F6F2"/>
      <rect x="6" y="6" width="68" height="10" rx="3" fill="#FFFFFF"/>
      <rect x="6" y="22" width="42" height="24" rx="3" fill="#F0EDE8"/>
      <rect x="52" y="22" width="22" height="24" rx="3" fill="#F0EDE8"/>
      <rect x="10" y="27" width="24" height="3" rx="1" fill="#C8C4BE"/>
      <rect x="10" y="32" width="16" height="2" rx="1" fill="#E0DDD8"/>
    </svg>
  );
  // System: split
  return (
    <svg viewBox="0 0 80 52" className="w-full h-full rounded-md">
      <clipPath id="lhalf"><rect width="40" height="52"/></clipPath>
      <clipPath id="rhalf"><rect x="40" y="0" width="40" height="52"/></clipPath>
      {/* Dark half */}
      <rect width="80" height="52" fill="#0C0C0C" clipPath="url(#lhalf)"/>
      <rect x="6" y="6" width="30" height="8" rx="2" fill="#181818" clipPath="url(#lhalf)"/>
      <rect x="6" y="20" width="30" height="8" rx="2" fill="#151515" clipPath="url(#lhalf)"/>
      {/* Light half */}
      <rect width="80" height="52" fill="#F8F6F2" clipPath="url(#rhalf)"/>
      <rect x="44" y="6" width="30" height="8" rx="2" fill="#FFFFFF" clipPath="url(#rhalf)"/>
      <rect x="44" y="20" width="30" height="8" rx="2" fill="#F0EDE8" clipPath="url(#rhalf)"/>
      {/* Divider */}
      <line x1="40" y1="0" x2="40" y2="52" stroke="#444" strokeWidth="1"/>
    </svg>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-senses-border last:border-b-0 py-8">
      <h2 className="text-senses-text text-base font-medium mb-1">{title}</h2>
      <div className="mt-5">{children}</div>
    </div>
  );
}

// ─── Toggle row ───────────────────────────────────────────────────────────────
function ToggleRow({
  label, description, value, onChange,
}: {
  label: string; description?: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-senses-border/40 last:border-b-0">
      <div>
        <p className="text-senses-text text-sm">{label}</p>
        {description && <p className="text-senses-text-3 text-xs mt-0.5">{description}</p>}
      </div>
      <button
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 flex-shrink-0
                    ${value ? 'bg-senses-accent' : 'bg-senses-surface-3 border border-senses-border-2'}`}
        style={{ height: '22px', width: '40px' }}
      >
        <span
          className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200
                      ${value ? 'translate-x-[20px]' : 'translate-x-[3px]'}`}
        />
      </button>
    </div>
  );
}

// ─── Main settings page ───────────────────────────────────────────────────────
export function SettingsPage() {
  const [settings, setSettings] = useState<SensesSettings | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    const s = getSettings();
    setSettings(s);
    applySettings(s);
  }, []);

  function patch(updates: Partial<SensesSettings>) {
    setSettings(prev => {
      const next = { ...prev!, ...updates };
      saveSettings(next);
      return next;
    });
  }

  function resetInterests() {
    try {
      const raw = JSON.parse(localStorage.getItem('senses:user-state') || '{}');
      raw.interestSignals = {};
      localStorage.setItem('senses:user-state', JSON.stringify(raw));
      toast('Interest signals cleared', 'success');
    } catch {
      toast('Could not clear interests', 'error');
    }
  }

  function clearHistory() {
    try {
      const raw = JSON.parse(localStorage.getItem('senses:user-state') || '{}');
      raw.recentlyViewed = [];
      localStorage.setItem('senses:user-state', JSON.stringify(raw));
      toast('Viewing history cleared', 'success');
    } catch {
      toast('Could not clear history', 'error');
    }
  }

  function clearAllData() {
    try {
      ['senses:user-state','senses:comments','senses:user-collections','senses:downloads','senses:settings'].forEach(k => {
        try { localStorage.removeItem(k); } catch {}
      });
      toast('All SENSES data cleared. Refreshing…', 'info');
      setTimeout(() => window.location.reload(), 1200);
    } catch {
      toast('Could not clear data', 'error');
    }
    setConfirmClear(false);
  }

  if (!settings) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="space-y-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-senses-surface-2 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const themes: { value: ThemeMode; label: string; desc: string }[] = [
    { value: 'dark',   label: 'Dark',   desc: 'Deep black — easy on the eyes at night' },
    { value: 'light',  label: 'Light',  desc: 'Clean and warm for bright spaces' },
    { value: 'system', label: 'System', desc: 'Follows your device preference automatically' },
  ];

  const densities: { value: DensityKey; label: string; desc: string }[] = [
    { value: 'comfortable', label: 'Comfortable', desc: 'More breathing room, larger cards' },
    { value: 'compact',     label: 'Compact',     desc: 'Tighter spacing, more content per screen' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">

      {/* ── Appearance ── */}
      <Section title="Appearance">

        {/* Theme */}
        <div className="mb-8">
          <p className="text-senses-text-3 text-xs tracking-widest uppercase mb-3">Theme</p>
          <div className="grid grid-cols-3 gap-3">
            {themes.map(t => (
              <button
                key={t.value}
                onClick={() => patch({ theme: t.value })}
                className={`p-3 rounded-xl border-2 text-left transition-all duration-200 group
                  ${settings.theme === t.value
                    ? 'border-senses-accent bg-senses-surface-2 shadow-[0_0_16px_rgba(255,45,85,0.2)]'
                    : 'border-senses-border bg-senses-surface hover:border-senses-border-2'
                  }`}
              >
                <div className="aspect-[80/52] mb-2.5 overflow-hidden rounded-md">
                  <ThemePreview mode={t.value} />
                </div>
                <p className={`text-sm font-medium ${settings.theme === t.value ? 'text-senses-accent' : 'text-senses-text'}`}>
                  {t.label}
                </p>
                <p className="text-senses-text-3 text-[11px] mt-0.5 leading-relaxed hidden sm:block">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Accent color */}
        <div>
          <p className="text-senses-text-3 text-xs tracking-widest uppercase mb-3">Accent Color</p>
          <div className="flex flex-wrap gap-3">
            {(Object.entries(ACCENT_COLORS) as [AccentKey, { hex: string; label: string }][]).map(([key, { hex, label }]) => (
              <button
                key={key}
                onClick={() => patch({ accent: key })}
                title={label}
                className="group flex flex-col items-center gap-1.5"
              >
                <span
                  className={`w-9 h-9 rounded-full block transition-all duration-200
                    ${settings.accent === key
                      ? 'ring-2 ring-offset-2 ring-offset-senses-bg scale-110 shadow-lg'
                      : 'hover:scale-105 opacity-75 hover:opacity-100'
                    }`}
                  style={{
                    backgroundColor: hex,
                    boxShadow: settings.accent === key ? `0 0 14px ${hex}80` : undefined,
                    ['--tw-ring-color' as string]: hex,
                  }}
                />
                <span className={`text-[10px] transition-colors ${settings.accent === key ? 'text-senses-text' : 'text-senses-text-3'}`}>
                  {label.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
          <p className="text-senses-text-3 text-xs mt-3">
            Current: <span className="text-senses-text font-medium">{ACCENT_COLORS[settings.accent].label}</span>
            {' '}
            <span style={{ color: ACCENT_COLORS[settings.accent].hex }}>
              {ACCENT_COLORS[settings.accent].hex}
            </span>
          </p>
        </div>

      </Section>

      {/* ── Display ── */}
      <Section title="Display">
        <div className="mb-6">
          <p className="text-senses-text-3 text-xs tracking-widest uppercase mb-3">Density</p>
          <div className="grid grid-cols-2 gap-3">
            {densities.map(d => (
              <button
                key={d.value}
                onClick={() => patch({ density: d.value })}
                className={`p-4 rounded-xl border-2 text-left transition-all duration-200
                  ${settings.density === d.value
                    ? 'border-senses-accent bg-senses-surface-2'
                    : 'border-senses-border bg-senses-surface hover:border-senses-border-2'
                  }`}
              >
                <p className={`text-sm font-medium ${settings.density === d.value ? 'text-senses-accent' : 'text-senses-text'}`}>
                  {d.label}
                </p>
                <p className="text-senses-text-3 text-xs mt-1">{d.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-0 rounded-xl bg-senses-surface border border-senses-border px-4 py-1">
          <ToggleRow label="Show Mood Strip" description="Mood filter pills on the Explore page" value={settings.showMoodStrip} onChange={v => patch({ showMoodStrip: v })} />
          <ToggleRow label="Show Style Strip" description="Style filter pills on the Explore page" value={settings.showStyleStrip} onChange={v => patch({ showStyleStrip: v })} />
          <ToggleRow label="Show For You" description="Personalised recommendation section on home" value={settings.showForYou} onChange={v => patch({ showForYou: v })} />
          <ToggleRow label="Show Recently Viewed" description="Your recently viewed items on home and My Senses" value={settings.showRecentlyViewed} onChange={v => patch({ showRecentlyViewed: v })} />
        </div>
      </Section>

      {/* ── Playback & Download ── */}
      <Section title="Playback & Download">
        <div className="space-y-0 rounded-xl bg-senses-surface border border-senses-border px-4 py-1">
          <ToggleRow
            label="Autoplay Discovery Reel"
            description="Automatically advance to the next item in Reel mode"
            value={settings.autoplayDiscovery}
            onChange={v => patch({ autoplayDiscovery: v })}
          />
        </div>

        <div className="mt-5">
          <p className="text-senses-text-3 text-xs tracking-widest uppercase mb-3">Download Quality</p>
          <div className="flex gap-3">
            {(['original', 'preview'] as const).map(fmt => (
              <button
                key={fmt}
                onClick={() => patch({ downloadFormat: fmt })}
                className={`px-4 py-2 rounded-lg border text-sm capitalize transition-all
                  ${settings.downloadFormat === fmt
                    ? 'border-senses-accent bg-senses-accent/10 text-senses-accent'
                    : 'border-senses-border text-senses-text-2 hover:border-senses-border-2'
                  }`}
              >
                {fmt === 'original' ? 'Original quality' : 'Preview (smaller)'}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Data & Privacy ── */}
      <Section title="Data & Privacy">
        <p className="text-senses-text-3 text-sm mb-5">
          All your data lives locally in your browser. Nothing is sent to a server.
        </p>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between p-4 rounded-xl bg-senses-surface border border-senses-border">
            <div>
              <p className="text-senses-text text-sm font-medium">Interest Signals</p>
              <p className="text-senses-text-3 text-xs mt-0.5">Clears the data that powers personalised recommendations</p>
            </div>
            <button
              onClick={resetInterests}
              className="px-4 py-1.5 rounded-lg border border-senses-border text-senses-text-2 hover:text-senses-text hover:border-senses-border-2 text-sm transition-all flex-shrink-0 ml-4"
            >
              Reset
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-senses-surface border border-senses-border">
            <div>
              <p className="text-senses-text text-sm font-medium">Viewing History</p>
              <p className="text-senses-text-3 text-xs mt-0.5">Removes your recently viewed items list</p>
            </div>
            <button
              onClick={clearHistory}
              className="px-4 py-1.5 rounded-lg border border-senses-border text-senses-text-2 hover:text-senses-text hover:border-senses-border-2 text-sm transition-all flex-shrink-0 ml-4"
            >
              Clear
            </button>
          </div>

          <div className="p-4 rounded-xl bg-senses-surface border border-red-900/40">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-400 text-sm font-medium">Clear All Data</p>
                <p className="text-senses-text-3 text-xs mt-0.5">Removes all likes, saves, collections, history, and settings</p>
              </div>
              {!confirmClear ? (
                <button
                  onClick={() => setConfirmClear(true)}
                  className="px-4 py-1.5 rounded-lg border border-red-900/50 text-red-400/70 hover:text-red-400 hover:border-red-800 text-sm transition-all flex-shrink-0 ml-4"
                >
                  Clear All
                </button>
              ) : (
                <div className="flex gap-2 ml-4">
                  <button onClick={() => setConfirmClear(false)} className="px-3 py-1.5 rounded-lg border border-senses-border text-senses-text-2 text-sm">Cancel</button>
                  <button onClick={clearAllData} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-medium">Confirm</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Section>

      {/* ── About ── */}
      <div className="pt-8 pb-4 text-center">
        <p className="brand-shimmer text-2xl mb-1">SENSES</p>
        <p className="text-senses-text-3 text-xs">Premium Media Discovery &nbsp;·&nbsp; v1.0</p>
        <div className="flex justify-center gap-4 mt-3">
          <a href="/about"     className="text-senses-text-3 hover:text-senses-text text-xs transition-colors">About</a>
          <a href="/privacy"   className="text-senses-text-3 hover:text-senses-text text-xs transition-colors">Privacy</a>
          <a href="/licensing" className="text-senses-text-3 hover:text-senses-text text-xs transition-colors">Licensing</a>
          <a href="/faq"       className="text-senses-text-3 hover:text-senses-text text-xs transition-colors">FAQ</a>
        </div>
      </div>

    </div>
  );
}
