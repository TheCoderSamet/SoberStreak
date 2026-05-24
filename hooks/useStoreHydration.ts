import { useEffect, useState } from 'react';
import { useJournalStore } from '../store/useJournalStore';
import { useProgressHistoryStore } from '../store/useProgressHistoryStore';
import { useThemeStore } from '../store/useThemeStore';
import { useUserStore } from '../store/useUserStore';

type HydratableStore = {
  persist: {
    hasHydrated: () => boolean;
    onFinishHydration: (callback: () => void) => () => void;
  };
};

export function usePersistStoreHydrated(store: HydratableStore): boolean {
  const [hydrated, setHydrated] = useState(() => store.persist.hasHydrated());

  useEffect(() => {
    if (store.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    return store.persist.onFinishHydration(() => setHydrated(true));
  }, [store]);

  return hydrated;
}

/** True once all persisted Zustand stores have finished rehydrating from AsyncStorage. */
export function useAppStoresHydrated(): boolean {
  const userHydrated = usePersistStoreHydrated(useUserStore);
  const themeHydrated = usePersistStoreHydrated(useThemeStore);
  const journalHydrated = usePersistStoreHydrated(useJournalStore);
  const historyHydrated = usePersistStoreHydrated(useProgressHistoryStore);

  return (
    userHydrated &&
    themeHydrated &&
    journalHydrated &&
    historyHydrated
  );
}
