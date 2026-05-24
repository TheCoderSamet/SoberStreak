import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export type LocalSubscriptionStatus = 'free' | 'premium';
export type PremiumSource = 'server';

interface SubscriptionStore {
  status: LocalSubscriptionStatus;
  isPremium: boolean;
  serverPremium: boolean;
  source?: PremiumSource;
  loading: boolean;
  error: string | null;
  setPremiumFromServer: (value: boolean) => void;
  fetchPremiumStatus: (userId: string) => Promise<void>;
  clearPremiumOnSignOut: () => void;
  resetSubscription: () => void;
}

function applyServerPremium(serverPremium: boolean) {
  return {
    serverPremium,
    isPremium: serverPremium,
    status: serverPremium ? ('premium' as const) : ('free' as const),
    source: serverPremium ? ('server' as const) : undefined,
  };
}

const FREE_STATE = {
  status: 'free' as const,
  isPremium: false,
  serverPremium: false,
  source: undefined,
};

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
  ...FREE_STATE,
  loading: false,
  error: null,

  setPremiumFromServer: (value) =>
    set({
      ...applyServerPremium(value),
      error: null,
    }),

  fetchPremiumStatus: async (userId) => {
    set({ loading: true, error: null });

    const { data, error } = await supabase
      .from('profiles')
      .select('is_premium')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('[Premium] fetchPremiumStatus:', error.message, error);
      set({ loading: false, error: error.message });
      return;
    }

    const granted = data.is_premium === true;
    set({
      ...applyServerPremium(granted),
      loading: false,
      error: null,
    });
  },

  clearPremiumOnSignOut: () =>
    set({
      ...FREE_STATE,
      loading: false,
      error: null,
    }),

  resetSubscription: () =>
    set({
      ...FREE_STATE,
      loading: false,
      error: null,
    }),
}));

export function getPremiumStatusLabel(state: {
  serverPremium: boolean;
  isPremium: boolean;
  source?: PremiumSource;
  loading: boolean;
}): string {
  if (state.loading) {
    return 'Checking premium status…';
  }
  if (state.serverPremium || state.source === 'server' || state.isPremium) {
    return 'Premium · Plan from account';
  }
  return 'Free plan';
}
