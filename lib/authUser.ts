import type { User } from '@supabase/supabase-js';

export function getDisplayNameFromUser(user: User | null): string {
  if (!user) return '';
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const displayName = meta?.display_name;
  if (typeof displayName === 'string' && displayName.trim().length > 0) {
    return displayName.trim();
  }
  if (user.email) {
    return user.email.split('@')[0] ?? 'User';
  }
  return 'User';
}
