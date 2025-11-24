import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'system';

interface UIState {
  isSidebarOpen: boolean;
  themeMode: ThemeMode;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setThemeMode: (mode: ThemeMode) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: false,
  themeMode: 'system',
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  setThemeMode: (mode) => set({ themeMode: mode }),
}));
