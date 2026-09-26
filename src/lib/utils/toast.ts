export type ToastType = 'success' | 'error' | 'info';

export function toast(message: string, type: ToastType = 'success'): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('senses:toast', { detail: { message, type } })
  );
}
