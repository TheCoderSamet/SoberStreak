import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ProgressHistoryItem } from '../types';

interface ProgressHistoryStore {
  history: ProgressHistoryItem[];
  addHistoryItem: (item: ProgressHistoryItem) => void;
  deleteHistoryItem: (id: string) => void;
  replaceHistoryItemId: (oldId: string, newId: string) => void;
  remapHabitId: (oldHabitId: string, newHabitId: string) => void;
  setHistory: (history: ProgressHistoryItem[]) => void;
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
      replaceHistoryItemId: (oldId, newId) =>
        set((state) => ({
          history: state.history.map((entry) =>
            entry.id === oldId ? { ...entry, id: newId } : entry
          ),
        })),
      remapHabitId: (oldHabitId, newHabitId) =>
        set((state) => ({
          history: state.history.map((entry) =>
            entry.habitId === oldHabitId ? { ...entry, habitId: newHabitId } : entry
          ),
        })),
      setHistory: (history) => set({ history }),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'sober-streak-progress-history',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
