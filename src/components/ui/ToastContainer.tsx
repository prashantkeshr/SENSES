import { useState, useEffect } from 'react';
import type { ToastType } from '@/lib/utils/toast';

interface ToastItem {
  id:      string;
  message: string;
  type:    ToastType;
}

const ICONS: Record<ToastType, JSX.Element> = {
  success: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 flex-shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
    </svg>
  ),
  error: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 flex-shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"/>
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 flex-shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"/>
    </svg>
  ),
};

const COLORS: Record<ToastType, string> = {
  success: 'text-emerald-400',
  error:   'text-red-400',
  info:    'text-senses-hearing',
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const { message, type } = (e as CustomEvent<{ message: string; type: ToastType }>).detail;
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

      setToasts(prev => [...prev, { id, message, type }].slice(-4));

      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 3200);
    };

    window.addEventListener('senses:toast', handler);
    return () => window.removeEventListener('senses:toast', handler);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-6 right-4 sm:right-6 z-[60] flex flex-col gap-2 items-end pointer-events-none"
    >
      {toasts.map(t => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl bg-senses-surface border border-senses-border shadow-xl shadow-black/50 text-sm max-w-xs animate-in slide-in-from-right-4 duration-200"
        >
          <span className={COLORS[t.type]}>{ICONS[t.type]}</span>
          <span className="text-senses-text-2">{t.message}</span>
        </div>
      ))}
    </div>
  );
}
