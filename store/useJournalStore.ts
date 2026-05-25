import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { JournalEntry } from '../types';

interface JournalStore {
  entries: JournalEntry[];
  addEntry: (entry: JournalEntry) => void;
  deleteEntry: (id: string) => void;
  replaceEntryId: (oldId: string, newId: string) => void;
  remapHabitId: (oldHabitId: string, newHabitId: string) => void;
  setEntries: (entries: JournalEntry[]) => void;
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
      replaceEntryId: (oldId, newId) =>
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === oldId ? { ...entry, id: newId } : entry
          ),
        })),
      remapHabitId: (oldHabitId, newHabitId) =>
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.habitId === oldHabitId ? { ...entry, habitId: newHabitId } : entry
          ),
        })),
      setEntries: (entries) => set({ entries }),
      clearEntries: () => set({ entries: [] }),
    }),
    {
      name: 'sober-streak-journal',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
