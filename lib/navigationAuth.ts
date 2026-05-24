import type { Href } from 'expo-router';
import { router } from 'expo-router';

const LOGIN_ROUTE = '/(auth)/login' as Href;

/** Clears navigation history and shows login (after sign out). */
export function resetToLogin(): void {
  if (router.canDismiss()) {
    router.dismissAll();
  }
  router.replace(LOGIN_ROUTE);
}
