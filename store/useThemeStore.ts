import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ThemeMode } from '../types';

interface ThemeStore {
  mode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      mode: 'system',
      setThemeMode: (mode) => set({ mode }),
    }),
    {
      name: 'sober-streak-theme',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
