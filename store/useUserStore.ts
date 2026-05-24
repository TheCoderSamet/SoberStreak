import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isAllHabitsView } from '../lib/habitScope';
import { findHabitById, getAllHabits } from '../lib/habitUtils';
import { createHabitFromDefinition, getHabitDefinition } from '../lib/onboarding';
import { Habit, HabitType, UserProfile } from '../types';

interface UserStore {
  profile: UserProfile;
  /** Last real habit picked (kept when Home is on All habits) */
  lastSpecificHabitId?: string;
  setPrimaryHabit: (habit: Habit) => void;
  setOnboardingHabitType: (type: HabitType) => void;
  updatePrimaryHabit: (updates: Partial<Habit>) => void;
  addAdditionalHabit: (habit: Habit) => void;
  updateHabit: (habitId: string, updates: Partial<Habit>) => void;
  remapHabitId: (oldId: string, newId: string) => void;
  deleteHabit: (habitId: string) => void;
  setActiveHabit: (habitId: string) => void;
  completeOnboarding: () => void;
  completeOnboardingWithNotifications: (enabled: boolean, time?: string) => void;
  replaceProfile: (profile: UserProfile) => void;
  resetProfile: () => void;
  updateNotifications: (enabled: boolean, time?: string) => void;
}

export const defaultProfile: UserProfile = {
  hasCompletedOnboarding: false,
  primaryHabit: null,
  additionalHabits: [],
  activeHabitId: undefined,
  notificationsEnabled: false,
  preferredReminderTime: '09:00',
  currency: 'AUD',
};

function withActiveHabitDefault(profile: UserProfile): UserProfile {
  const activeHabitId =
    profile.activeHabitId ?? profile.primaryHabit?.id ?? undefined;
  return {
    ...profile,
    additionalHabits: profile.additionalHabits ?? [],
    activeHabitId,
  };
}

function mergeHabitUpdate(habit: Habit, updates: Partial<Habit>): Habit {
  return { ...habit, ...updates };
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      profile: defaultProfile,
      lastSpecificHabitId: undefined,
      setPrimaryHabit: (habit) =>
        set((state) => ({
          profile: withActiveHabitDefault({
            ...state.profile,
            primaryHabit: habit,
            activeHabitId: habit.id,
          }),
          lastSpecificHabitId: habit.id,
        })),
      setOnboardingHabitType: (type) => {
        const definition = getHabitDefinition(type);
        if (!definition) return;
        const habit = createHabitFromDefinition(definition);
        set((state) => ({
          profile: withActiveHabitDefault({
            ...state.profile,
            primaryHabit: habit,
            activeHabitId: habit.id,
          }),
          lastSpecificHabitId: habit.id,
        }));
      },
      updatePrimaryHabit: (updates) =>
        set((state) => {
          if (!state.profile.primaryHabit) return state;
          const primaryHabit = mergeHabitUpdate(state.profile.primaryHabit, updates);
          return {
            profile: withActiveHabitDefault({
              ...state.profile,
              primaryHabit,
            }),
          };
        }),
      addAdditionalHabit: (habit) =>
        set((state) => {
          if (!state.profile.primaryHabit) return state;
          const exists = getAllHabits(state.profile).some((h) => h.id === habit.id);
          if (exists) return state;
          return {
            profile: withActiveHabitDefault({
              ...state.profile,
              additionalHabits: [...state.profile.additionalHabits, habit],
              activeHabitId: habit.id,
            }),
            lastSpecificHabitId: habit.id,
          };
        }),
      updateHabit: (habitId, updates) =>
        set((state) => {
          const { profile } = state;
          if (profile.primaryHabit?.id === habitId) {
            return {
              profile: withActiveHabitDefault({
                ...profile,
                primaryHabit: mergeHabitUpdate(profile.primaryHabit, updates),
                activeHabitId:
                  updates.id && profile.activeHabitId === habitId
                    ? updates.id
                    : profile.activeHabitId,
              }),
            };
          }
          const index = profile.additionalHabits.findIndex((h) => h.id === habitId);
          if (index === -1) return state;
          const additionalHabits = [...profile.additionalHabits];
          additionalHabits[index] = mergeHabitUpdate(additionalHabits[index], updates);
          return {
            profile: withActiveHabitDefault({
              ...profile,
              additionalHabits,
              activeHabitId:
                updates.id && profile.activeHabitId === habitId ? updates.id : profile.activeHabitId,
            }),
          };
        }),
      remapHabitId: (oldId, newId) =>
        set((state) => {
          const { profile } = state;
          if (profile.primaryHabit?.id === oldId) {
            return {
              profile: withActiveHabitDefault({
                ...profile,
                primaryHabit: { ...profile.primaryHabit, id: newId },
                activeHabitId: profile.activeHabitId === oldId ? newId : profile.activeHabitId,
              }),
            };
          }
          const additionalHabits = profile.additionalHabits.map((h) =>
            h.id === oldId ? { ...h, id: newId } : h
          );
          return {
            profile: withActiveHabitDefault({
              ...profile,
              additionalHabits,
              activeHabitId: profile.activeHabitId === oldId ? newId : profile.activeHabitId,
            }),
          };
        }),
      deleteHabit: (habitId) =>
        set((state) => {
          const { profile } = state;
          if (!findHabitById(profile, habitId)) return state;

          if (profile.primaryHabit?.id === habitId) {
            const [next, ...rest] = profile.additionalHabits;
            if (!next) {
              return {
                profile: withActiveHabitDefault({
                  ...profile,
                  primaryHabit: null,
                  additionalHabits: [],
                  activeHabitId: undefined,
                }),
              };
            }
            return {
              profile: withActiveHabitDefault({
                ...profile,
                primaryHabit: next,
                additionalHabits: rest,
                activeHabitId:
                  profile.activeHabitId === habitId ? next.id : profile.activeHabitId,
              }),
            };
          }

          const additionalHabits = profile.additionalHabits.filter((h) => h.id !== habitId);
          let activeHabitId = profile.activeHabitId;
          if (activeHabitId === habitId) {
            activeHabitId = profile.primaryHabit?.id;
          }
          let lastSpecificHabitId = state.lastSpecificHabitId;
          if (lastSpecificHabitId === habitId) {
            lastSpecificHabitId = profile.primaryHabit?.id;
          }

          return {
            profile: withActiveHabitDefault({
              ...profile,
              additionalHabits,
              activeHabitId,
            }),
            lastSpecificHabitId,
          };
        }),
      setActiveHabit: (habitId) =>
        set((state) => {
          const canSelectAll =
            isAllHabitsView(habitId) && getAllHabits(state.profile).length > 1;
          if (!canSelectAll && !findHabitById(state.profile, habitId)) return state;

          const lastSpecificHabitId = isAllHabitsView(habitId)
            ? (() => {
                const current = state.profile.activeHabitId;
                if (
                  current &&
                  !isAllHabitsView(current) &&
                  findHabitById(state.profile, current)
                ) {
                  return current;
                }
                if (
                  state.lastSpecificHabitId &&
                  findHabitById(state.profile, state.lastSpecificHabitId)
                ) {
                  return state.lastSpecificHabitId;
                }
                return state.profile.primaryHabit?.id;
              })()
            : habitId;

          return {
            profile: withActiveHabitDefault({
              ...state.profile,
              activeHabitId: habitId,
            }),
            lastSpecificHabitId,
          };
        }),
      completeOnboarding: () =>
        set((state) => ({
          profile: withActiveHabitDefault({
            ...state.profile,
            hasCompletedOnboarding: true,
          }),
        })),
      completeOnboardingWithNotifications: (enabled, time) =>
        set((state) => ({
          profile: withActiveHabitDefault({
            ...state.profile,
            notificationsEnabled: enabled,
            preferredReminderTime:
              time !== undefined ? time : state.profile.preferredReminderTime,
            hasCompletedOnboarding: true,
          }),
        })),
      replaceProfile: (profile) => set({ profile: withActiveHabitDefault(profile) }),
      updateNotifications: (enabled, time) =>
        set((state) => ({
          profile: withActiveHabitDefault({
            ...state.profile,
            notificationsEnabled: enabled,
            preferredReminderTime:
              time !== undefined ? time : state.profile.preferredReminderTime,
          }),
        })),
      resetProfile: () =>
        set({ profile: defaultProfile, lastSpecificHabitId: undefined }),
    }),
    {
      name: 'sober-streak-user',
      storage: createJSONStorage(() => AsyncStorage),
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<UserStore> | undefined;
        const profile = withActiveHabitDefault({
          ...defaultProfile,
          ...(persistedState?.profile ?? {}),
        });
        return {
          ...current,
          ...persistedState,
          profile,
        };
      },
    }
  )
);
