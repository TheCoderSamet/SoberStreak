import { isAllHabitsView } from './habitScope';
import { Habit, UserProfile } from '../types';

export function getAllHabits(profile: UserProfile): Habit[] {
  const habits: Habit[] = [];
  if (profile.primaryHabit) {
    habits.push(profile.primaryHabit);
  }
  if (profile.additionalHabits?.length) {
    habits.push(...profile.additionalHabits);
  }
  return habits;
}

export function getActiveHabit(profile: UserProfile): Habit | null {
  const all = getAllHabits(profile);
  if (all.length === 0) return null;
  if (isAllHabitsView(profile.activeHabitId)) return null;

  const activeId = profile.activeHabitId;
  if (activeId) {
    const match = all.find((h) => h.id === activeId);
    if (match) return match;
  }

  return profile.primaryHabit;
}

export function findHabitById(profile: UserProfile, habitId: string): Habit | null {
  return getAllHabits(profile).find((h) => h.id === habitId) ?? null;
}

export function isPrimaryHabit(profile: UserProfile, habitId: string): boolean {
  return profile.primaryHabit?.id === habitId;
}

export function getTotalHabitCount(profile: UserProfile): number {
  return getAllHabits(profile).length;
}
