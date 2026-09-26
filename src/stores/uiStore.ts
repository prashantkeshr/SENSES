import { create } from 'zustand';

interface UIStore {
  searchOpen:    boolean;
  mobileNavOpen: boolean;
  theme:         'dark' | 'light';
  openSearch:    () => void;
  closeSearch:   () => void;
  toggleMobileNav: () => void;
  closeMobileNav:  () => void;
  setTheme:      (theme: 'dark' | 'light') => void;
}

export const useUIStore = create<UIStore>(set => ({
  searchOpen:    false,
  mobileNavOpen: false,
  theme:         'dark',
  openSearch:    () => set({ searchOpen: true }),
  closeSearch:   () => set({ searchOpen: false }),
  toggleMobileNav: () => set(s => ({ mobileNavOpen: !s.mobileNavOpen })),
  closeMobileNav:  () => set({ mobileNavOpen: false }),
  setTheme:      theme => set({ theme }),
}));
