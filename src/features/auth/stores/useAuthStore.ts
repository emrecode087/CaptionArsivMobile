import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { UserDto } from '../domain/types';

interface AuthState {
  isAuthenticated: boolean;
  user: UserDto | null;
  accessToken: string | null;
  refreshToken: string | null;
  hasSeenOnboarding: boolean;
  login: (accessToken: string, refreshToken: string, user: UserDto) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: UserDto | null) => void;
  logout: () => void;
  setHasSeenOnboarding: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      hasSeenOnboarding: false,
      login: (accessToken, refreshToken, user) => 
        set({ isAuthenticated: true, accessToken, refreshToken, user }),
      setTokens: (accessToken, refreshToken) => 
        set({ accessToken, refreshToken }),
      setUser: (user) => set({ user }),
      logout: () => 
        set({ isAuthenticated: false, accessToken: null, refreshToken: null, user: null }),
      setHasSeenOnboarding: () => set({ hasSeenOnboarding: true }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
