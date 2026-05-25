import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SyncStore {
  syncing: boolean;
  lastSyncedAt?: string;
  lastError: string | null;
  startSync: () => void;
  finishSync: () => void;
  failSync: (message: string) => void;
  clearSyncError: () => void;
}

export const useSyncStore = create<SyncStore>()(
  persist(
    (set) => ({
      syncing: false,
      lastSyncedAt: undefined,
      lastError: null,
      startSync: () => set({ syncing: true, lastError: null }),
      finishSync: () =>
        set({ syncing: false, lastSyncedAt: new Date().toISOString(), lastError: null }),
      failSync: (message) => set({ syncing: false, lastError: message }),
      clearSyncError: () => set({ lastError: null }),
    }),
    {
      name: 'sober-streak-sync-meta',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        lastSyncedAt: state.lastSyncedAt,
        lastError: state.lastError,
      }),
    }
  )
);
