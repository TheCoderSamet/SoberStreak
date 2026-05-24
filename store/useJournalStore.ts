import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { JournalEntry } from '../types';

interface JournalStore {
  entries: JournalEntry[];
  addEntry: (entry: JournalEntry) => void;
  deleteEntry: (id: string) => void;
  clearEntries: () => void;
}

export const useJournalStore = create<JournalStore>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (entry) =>
        set((state) => ({ entries: [entry, ...state.entries] })),
      deleteEntry: (id) =>
        set((state) => ({
          entries: state.entries.filter((entry) => entry.id !== id),
        })),
      clearEntries: () => set({ entries: [] }),
    }),
    {
      name: 'sober-streak-journal',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
