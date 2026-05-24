import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useSubscriptionStore } from '../store/useSubscriptionStore';

/** Refetch server premium when auth session is ready or user id changes. */
export function usePremiumSync(): void {
  const initialized = useAuthStore((s) => s.initialized);
  const userId = useAuthStore((s) => s.user?.id);

  useEffect(() => {
    if (!initialized) return;

    if (userId) {
      void useSubscriptionStore.getState().fetchPremiumStatus(userId);
    } else {
      useSubscriptionStore.getState().clearPremiumOnSignOut();
    }
  }, [initialized, userId]);
}
