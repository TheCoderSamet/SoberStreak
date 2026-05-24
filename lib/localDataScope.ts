import AsyncStorage from '@react-native-async-storage/async-storage';
import { pullRemoteProfileIntoLocal } from './habitSync';
import { useJournalStore } from '../store/useJournalStore';
import { useProgressHistoryStore } from '../store/useProgressHistoryStore';
import { useUserStore } from '../store/useUserStore';

const BOUND_AUTH_USER_ID_KEY = 'sober-streak-bound-auth-user-id';

/** Clears local habit/journal/progress so a new account starts fresh onboarding. */
export function resetLocalDataForNewAccount(): void {
  useUserStore.getState().resetProfile();
  useJournalStore.getState().clearEntries();
  useProgressHistoryStore.getState().clearHistory();
}

/**
 * Binds on-device data to one Supabase user. Resets local stores when a different user signs in.
 * Same user: restores from Supabase if local onboarding was lost.
 */
export async function ensureLocalDataForAuthUser(userId: string): Promise<boolean> {
  const previous = await AsyncStorage.getItem(BOUND_AUTH_USER_ID_KEY);
  const isNewAccount = previous !== userId;

  if (isNewAccount) {
    resetLocalDataForNewAccount();
    await AsyncStorage.setItem(BOUND_AUTH_USER_ID_KEY, userId);
  }

  await pullRemoteProfileIntoLocal(userId);

  return isNewAccount;
}
