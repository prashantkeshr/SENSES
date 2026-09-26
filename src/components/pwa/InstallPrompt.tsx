import { useState, useEffect } from 'react';

const DISMISS_KEY = 'senses:pwa-install-dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [prompt,    setPrompt]    = useState<BeforeInstallPromptEvent | null>(null);
  const [visible,   setVisible]   = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }

    // Previously dismissed
    try {
      if (localStorage.getItem(DISMISS_KEY)) return;
    } catch { /* noop */ }

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      // Short delay so it doesn't pop immediately on page load
      setTimeout(() => setVisible(true), 4000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setInstalled(true));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setVisible(false);
    setPrompt(null);
  };

  const handleDismiss = () => {
    setVisible(false);
    try { localStorage.setItem(DISMISS_KEY, '1'); } catch { /* noop */ }
  };

  if (!visible || installed || !prompt) return null;

  return (
    <div
      role="dialog"
      aria-label="Install Senses app"
      className="fixed bottom-safe-area-inset-bottom left-4 right-4 sm:left-auto sm:right-6 sm:w-80 z-50 animate-in slide-in-from-bottom-4 duration-300"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.5rem)' }}
    >
      <div className="rounded-2xl bg-senses-surface border border-senses-border shadow-2xl shadow-black/60 overflow-hidden">
        {/* Top strip */}
        <div className="h-1 bg-gradient-to-r from-senses-sight via-senses-accent to-senses-hearing" />

        <div className="p-5 flex gap-4 items-start">
          {/* Icon */}
          <div className="w-12 h-12 rounded-xl bg-senses-bg border border-senses-border flex items-center justify-center flex-shrink-0">
            <span className="text-senses-accent text-lg font-light tracking-wider" style={{ fontFamily: 'Georgia, serif' }}>S</span>
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-senses-text text-sm font-medium leading-snug">Add Senses to your home screen</p>
            <p className="text-senses-text-3 text-xs mt-0.5 leading-relaxed">
              Discover media faster with the installed app experience.
            </p>

            <div className="flex gap-2 mt-3">
              <button
                onClick={handleInstall}
                className="flex-1 py-2 rounded-xl bg-senses-text text-senses-bg text-xs font-medium hover:bg-senses-accent transition-colors"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-2 rounded-xl bg-senses-surface-2 border border-senses-border text-senses-text-3 text-xs hover:text-senses-text transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
