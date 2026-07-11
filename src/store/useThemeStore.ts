import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeMode } from '../theme';

function applyDocumentTheme(mode: ThemeMode) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', mode);
}

interface ThemeState {
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'light',

      toggleTheme: () =>
        set((state) => {
          const next = state.mode === 'light' ? 'dark' : 'light';
          applyDocumentTheme(next);
          return { mode: next };
        }),

      setTheme: (mode: ThemeMode) => {
        applyDocumentTheme(mode);
        set({ mode });
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) applyDocumentTheme(state.mode);
      },
    }
  )
);

applyDocumentTheme(useThemeStore.getState().mode);

