import { getHabitDefinition, createHabitId, mapDefaultUnit } from './onboarding';
import {
  findHabitById,
  getAllHabits,
  getActiveHabit,
  getTotalHabitCount,
  isPrimaryHabit,
} from './habitUtils';
import { Habit, HabitType, UserProfile } from '../types';

export {
  findHabitById,
  getAllHabits,
  getActiveHabit,
  getTotalHabitCount,
  isPrimaryHabit,
} from './habitUtils';

export function canAddAnotherHabit(profile: UserProfile, isPremium: boolean): boolean {
  if (!profile.primaryHabit) return false;
  if (!isPremium) return false;
  return true;
}

export interface CreateHabitInput {
  type: HabitType;
  customName?: string;
  reason: string;
  dailyCost: number;
  quitDate: string;
}

export function createHabitFromInput(input: CreateHabitInput): Habit {
  const definition = getHabitDefinition(input.type);
  const name =
    input.type === 'custom'
      ? input.customName?.trim() || 'Custom habit'
      : (definition?.name ?? 'Habit');
  const unit = definition ? mapDefaultUnit(definition.defaultUnit) : 'custom';

  return {
    id: createHabitId(),
    type: input.type,
    name,
    quitDate: input.quitDate,
    dailyCost: input.dailyCost,
    reason: input.reason.trim(),
    unit,
    createdAt: new Date().toISOString(),
  };
}
