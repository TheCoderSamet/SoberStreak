import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ProgressHistoryItem } from '../types';

interface ProgressHistoryStore {
  history: ProgressHistoryItem[];
  addHistoryItem: (item: ProgressHistoryItem) => void;
  deleteHistoryItem: (id: string) => void;
  clearHistory: () => void;
}

export const useProgressHistoryStore = create<ProgressHistoryStore>()(
  persist(
    (set) => ({
      history: [],
      addHistoryItem: (item) =>
        set((state) => ({ history: [item, ...state.history] })),
      deleteHistoryItem: (id) =>
        set((state) => ({
          history: state.history.filter((entry) => entry.id !== id),
        })),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'sober-streak-progress-history',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
