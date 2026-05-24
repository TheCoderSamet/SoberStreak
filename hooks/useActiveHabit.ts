import { useMemo } from 'react';
import { findHabitById, getActiveHabit, getAllHabits } from '../lib/habitUtils';
import { resolveRouteParam } from '../lib/routeParams';
import { useUserStore } from '../store/useUserStore';
import { Habit } from '../types';

export function useActiveHabit(): Habit | null {
  const profile = useUserStore((s) => s.profile);
  return useMemo(() => getActiveHabit(profile), [profile]);
}

export function useAllHabits(): Habit[] {
  const profile = useUserStore((s) => s.profile);
  return useMemo(() => getAllHabits(profile), [profile]);
}

export function useHabitById(
  habitId: string | string[] | undefined
): Habit | null {
  const profile = useUserStore((s) => s.profile);
  const resolvedId = resolveRouteParam(habitId);
  return useMemo(() => {
    if (!resolvedId) return null;
    return findHabitById(profile, resolvedId);
  }, [profile, resolvedId]);
}
