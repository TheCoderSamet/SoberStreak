import { getAllHabits } from './habitUtils';
import type { UserProfile } from '../types';

/** True when the user has finished initial setup (flag or a habit with a quit date). */
export function hasFinishedOnboarding(profile: UserProfile): boolean {
  if (profile.hasCompletedOnboarding) return true;
  return getAllHabits(profile).some((h) => Boolean(h.quitDate?.trim()));
}
