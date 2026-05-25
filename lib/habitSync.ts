import { isAllHabitsView } from './habitScope';
import { getAllHabits } from './habitUtils';
import { supabase } from './supabase';
import { useJournalStore } from '../store/useJournalStore';
import { useProgressHistoryStore } from '../store/useProgressHistoryStore';
import { useUserStore } from '../store/useUserStore';
import type { Habit, HabitType, UserProfile } from '../types';
import { hasFinishedOnboarding } from './onboardingState';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type HabitRow = {
  id: string;
  user_id: string;
  type: string;
  name: string;
  reason: string | null;
  quit_date: string;
  daily_cost: number;
  unit: string | null;
  is_primary: boolean;
  is_active: boolean;
  created_at: string;
};

export function isUuid(id: string): boolean {
  return UUID_RE.test(id);
}

export function newSyncUuid(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `00000000-0000-4000-8000-${Date.now().toString(16).padStart(12, '0')}`.slice(0, 36);
}

function rowToHabit(row: HabitRow): Habit {
  return {
    id: row.id,
    type: row.type as HabitType,
    name: row.name,
    quitDate: row.quit_date,
    dailyCost: Number(row.daily_cost),
    reason: row.reason ?? '',
    unit: (row.unit as Habit['unit']) ?? 'custom',
    createdAt: row.created_at,
  };
}

function profileFromHabitRows(
  rows: HabitRow[],
  hasCompletedOnboarding: boolean,
  existing: UserProfile
): UserProfile {
  const sorted = [...rows].sort((a, b) => {
    if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  const primaryRow = sorted.find((r) => r.is_primary) ?? sorted[0];
  const additional = sorted.filter((r) => r.id !== primaryRow?.id);

  const activeRow = sorted.find((r) => r.is_active) ?? primaryRow;

  return {
    ...existing,
    hasCompletedOnboarding: hasCompletedOnboarding || rows.length > 0,
    primaryHabit: primaryRow ? rowToHabit(primaryRow) : null,
    additionalHabits: additional.map(rowToHabit),
    activeHabitId: activeRow?.id,
  };
}

function habitToRow(habit: Habit, userId: string, isPrimary: boolean, isActive: boolean) {
  const quitDate = habit.quitDate?.trim()
    ? new Date(habit.quitDate).toISOString()
    : new Date().toISOString();

  return {
    id: isUuid(habit.id) ? habit.id : newSyncUuid(),
    user_id: userId,
    type: habit.type,
    name: habit.name,
    reason: habit.reason || null,
    quit_date: quitDate,
    daily_cost: habit.dailyCost,
    unit: habit.unit,
    is_primary: isPrimary,
    is_active: isActive,
  };
}

export async function markOnboardingCompleteOnServer(userId: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ has_completed_onboarding: true })
    .eq('id', userId);

  if (error) {
    console.warn('[habitSync] markOnboardingComplete:', error.message);
  }
}

export async function upsertHabitOnServer(
  userId: string,
  habit: Habit,
  options: { isPrimary: boolean; isActive: boolean }
): Promise<Habit> {
  const row = habitToRow(habit, userId, options.isPrimary, options.isActive);
  const { error } = await supabase.from('habits').upsert(row, { onConflict: 'id' });

  if (error) {
    console.warn('[habitSync] upsertHabit:', error.message);
    return habit;
  }

  if (row.id !== habit.id) {
    useUserStore.getState().remapHabitId(habit.id, row.id);
    useJournalStore.getState().remapHabitId(habit.id, row.id);
    useProgressHistoryStore.getState().remapHabitId(habit.id, row.id);
    return { ...habit, id: row.id };
  }

  return habit;
}

export async function softDeleteHabitOnServer(habitId: string): Promise<void> {
  if (!isUuid(habitId)) return;

  const { error } = await supabase
    .from('habits')
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq('id', habitId);

  if (error) {
    console.warn('[habitSync] softDeleteHabit:', error.message);
  }
}

export async function syncAllHabitsToServer(userId: string): Promise<void> {
  const profile = useUserStore.getState().profile;
  const habits = getAllHabits(profile);
  const activeId = isAllHabitsView(profile.activeHabitId)
    ? profile.primaryHabit?.id
    : (profile.activeHabitId ?? profile.primaryHabit?.id);

  for (const habit of habits) {
    const isPrimary = profile.primaryHabit?.id === habit.id;
    const isActive = habit.id === activeId;
    await upsertHabitOnServer(userId, habit, { isPrimary, isActive });
  }

  if (hasFinishedOnboarding(profile)) {
    await markOnboardingCompleteOnServer(userId);
  }
}

/** Pull Supabase profile + habits into local store when needed. */
export async function pullRemoteProfileIntoLocal(userId: string): Promise<void> {
  const local = useUserStore.getState().profile;
  const localReady = hasFinishedOnboarding(local);

  const { data: profRow, error: profErr } = await supabase
    .from('profiles')
    .select('has_completed_onboarding')
    .eq('id', userId)
    .maybeSingle();

  if (profErr) {
    console.warn('[habitSync] fetch profile:', profErr.message);
  }

  const { data: rows, error: habitsErr } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true });

  if (habitsErr) {
    console.warn('[habitSync] fetch habits:', habitsErr.message);
    return;
  }

  const serverRows = (rows ?? []) as HabitRow[];
  const serverOnboarding = Boolean(profRow?.has_completed_onboarding) || serverRows.length > 0;
  const serverReady = serverOnboarding;

  if (serverReady && !localReady) {
    const merged = profileFromHabitRows(serverRows, Boolean(profRow?.has_completed_onboarding), local);
    useUserStore.getState().replaceProfile(merged);
    return;
  }

  if (localReady && serverRows.length === 0) {
    await syncAllHabitsToServer(userId);
    return;
  }

  if (localReady && serverReady && !local.hasCompletedOnboarding && profRow?.has_completed_onboarding) {
    const merged = profileFromHabitRows(serverRows, true, local);
    useUserStore.getState().replaceProfile(merged);
  }
}

export async function syncAfterProfileChange(userId: string | undefined): Promise<void> {
  if (!userId) return;
  await syncAllHabitsToServer(userId);
}
