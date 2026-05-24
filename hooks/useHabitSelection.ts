import { useMemo } from 'react';
import { useAllHabits } from './useActiveHabit';
import { ALL_HABITS_ID, isAllHabitsView } from '../lib/habitScope';
import { findHabitById, getAllHabits } from '../lib/habitUtils';
import { useSubscriptionStore } from '../store/useSubscriptionStore';
import { useUserStore } from '../store/useUserStore';
import type { Habit } from '../types';

function resolveFallbackHabitId(
  profile: ReturnType<typeof useUserStore.getState>['profile'],
  habitsWithQuit: Habit[],
  allHabits: Habit[],
  lastSpecificHabitId: string | undefined
): string | undefined {
  if (lastSpecificHabitId && findHabitById(profile, lastSpecificHabitId)) {
    return lastSpecificHabitId;
  }
  return habitsWithQuit[0]?.id ?? allHabits[0]?.id ?? profile.primaryHabit?.id;
}

/** Shared habit selection: last pick persists; Home "All" only when explicitly chosen. */
export function useHabitSelection() {
  const profile = useUserStore((s) => s.profile);
  const lastSpecificHabitId = useUserStore((s) => s.lastSpecificHabitId);
  const setActiveHabit = useUserStore((s) => s.setActiveHabit);
  const isPremium = useSubscriptionStore((s) => s.isPremium);
  const allHabits = useAllHabits();

  const showHabitPicker = isPremium && allHabits.length > 1;
  const habitsWithQuit = useMemo(
    () => allHabits.filter((h) => h.quitDate?.trim()),
    [allHabits]
  );
  const pickerHabits = habitsWithQuit.length > 0 ? habitsWithQuit : allHabits;

  const activeHabitId = profile.activeHabitId;
  const isAllView = showHabitPicker && isAllHabitsView(activeHabitId);

  const selectedHabitId = useMemo(() => {
    if (isAllHabitsView(activeHabitId)) {
      return resolveFallbackHabitId(profile, habitsWithQuit, allHabits, lastSpecificHabitId);
    }
    if (activeHabitId && findHabitById(profile, activeHabitId)) {
      return activeHabitId;
    }
    return resolveFallbackHabitId(profile, habitsWithQuit, allHabits, lastSpecificHabitId);
  }, [activeHabitId, allHabits, habitsWithQuit, lastSpecificHabitId, profile]);

  const selectedHabit = useMemo((): Habit | null => {
    if (!selectedHabitId) return allHabits[0] ?? null;
    return findHabitById(profile, selectedHabitId) ?? allHabits[0] ?? null;
  }, [allHabits, profile, selectedHabitId]);

  const homePickerActiveId = isAllView
    ? ALL_HABITS_ID
    : (selectedHabitId ?? ALL_HABITS_ID);

  const pickerNote = isAllView
    ? 'Home shows all habits combined. Swipe to focus on one — Home will follow your last choice.'
    : 'Swipe to switch habits. Your selection stays in sync across Home, Health, and Journal.';

  return {
    selectedHabit,
    selectedHabitId,
    isAllView,
    showHabitPicker,
    homePickerActiveId,
    pickerHabits,
    habitsWithQuit,
    allHabits,
    setActiveHabit,
    currency: profile.currency,
    hasAnyHabit: getAllHabits(profile).length > 0,
    pickerNote,
  };
}
