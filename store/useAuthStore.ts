import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { syncAllUserData } from '../lib/dataSync';
import { ensureLocalDataForAuthUser } from '../lib/localDataScope';
import { setProfileSyncUserId } from '../lib/profileSyncScheduler';
import { resetToLogin } from '../lib/navigationAuth';
import { supabase } from '../lib/supabase';
import { useSubscriptionStore } from './useSubscriptionStore';

interface AuthStore {
  session: Session | null;
  user: User | null;
  loading: boolean;
  initialized: boolean;
  /** True after profile/habits are loaded or synced for the signed-in user. */
  profileBootstrapReady: boolean;
  error: string | null;
  initializeAuth: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ error?: string; needsEmailConfirmation?: boolean; hasSession?: boolean }>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  updateDisplayName: (name: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

let authListenerAttached = false;

function mapAuthError(message: string): string {
  return message;
}

async function bootstrapUserData(userId: string | undefined): Promise<void> {
  setProfileSyncUserId(userId);

  if (!userId) {
    useAuthStore.setState({ profileBootstrapReady: true });
    return;
  }

  useAuthStore.setState({ profileBootstrapReady: false });
  try {
    await ensureLocalDataForAuthUser(userId);
    await syncAllUserData(userId);
    await useSubscriptionStore.getState().fetchPremiumStatus(userId);
  } finally {
    useAuthStore.setState({ profileBootstrapReady: true });
  }
}

function applyAuthSession(session: Session | null) {
  useAuthStore.setState({
    session,
    user: session?.user ?? null,
    error: null,
  });

  void bootstrapUserData(session?.user?.id);
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  session: null,
  user: null,
  loading: false,
  initialized: false,
  profileBootstrapReady: false,
  error: null,

  initializeAuth: async () => {
    if (get().initialized) return;

    set({ loading: true, error: null, profileBootstrapReady: false });

    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.warn('[Auth] getSession error:', error.message);
      }

      applyAuthSession(data.session);
      set({ initialized: true, loading: false });

      if (!authListenerAttached) {
        authListenerAttached = true;
        supabase.auth.onAuthStateChange((_event, session) => {
          applyAuthSession(session);
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initialize auth';
      console.warn('[Auth] initializeAuth failed:', message);
      set({ initialized: true, loading: false, profileBootstrapReady: true, error: message });
    }
  },

  signInWithEmail: async (email, password) => {
    set({ loading: true, error: null });
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    set({ loading: false });

    if (error) {
      const msg = mapAuthError(error.message);
      set({ error: msg });
      return { error: msg };
    }

    applyAuthSession(data.session);
    return {};
  },

  signUpWithEmail: async (name, email, password) => {
    set({ loading: true, error: null });
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          display_name: name.trim(),
        },
      },
    });
    set({ loading: false });

    if (error) {
      const msg = mapAuthError(error.message);
      set({ error: msg });
      return { error: msg };
    }

    const hasSession = Boolean(data.session);
    const needsEmailConfirmation = !hasSession && Boolean(data.user);

    if (hasSession) {
      applyAuthSession(data.session);
    }

    return { needsEmailConfirmation, hasSession };
  },

  resetPassword: async (email) => {
    set({ loading: true, error: null });
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());
    set({ loading: false });

    if (error) {
      const msg = mapAuthError(error.message);
      set({ error: msg });
      return { error: msg };
    }

    return {};
  },

  updateDisplayName: async (name) => {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      return { error: 'Name cannot be empty.' };
    }

    set({ loading: true, error: null });
    const { data, error } = await supabase.auth.updateUser({
      data: { display_name: trimmed },
    });
    set({ loading: false });

    if (error) {
      const msg = mapAuthError(error.message);
      set({ error: msg });
      return { error: msg };
    }

    if (data.user) {
      set({ user: data.user, error: null });
    }
    return {};
  },

  signOut: async () => {
    set({ loading: true, error: null });
    const { error } = await supabase.auth.signOut();
    useSubscriptionStore.getState().clearPremiumOnSignOut();
    set({
      session: null,
      user: null,
      loading: false,
      profileBootstrapReady: true,
      error: error ? mapAuthError(error.message) : null,
    });
    resetToLogin();
  },

  clearError: () => set({ error: null }),
}));
