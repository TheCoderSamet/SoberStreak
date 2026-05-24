import { HABIT_DEFINITIONS, HabitDefinition } from '../constants/habits';
import { Habit, HabitType } from '../types';

export function mapDefaultUnit(unit: string): Habit['unit'] {
  switch (unit) {
    case 'drinks':
      return 'drinks';
    case 'cigarettes':
      return 'cigarettes';
    case 'hours':
      return 'hours';
    case 'servings':
      return 'servings';
    default:
      return 'custom';
  }
}

export function createHabitId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `habit-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createHabitFromDefinition(definition: HabitDefinition): Habit {
  return {
    id: createHabitId(),
    type: definition.type,
    name: definition.name,
    quitDate: '',
    dailyCost: definition.defaultDailyCost,
    reason: '',
    unit: mapDefaultUnit(definition.defaultUnit),
    createdAt: new Date().toISOString(),
  };
}

export function getHabitDefinition(type: HabitType): HabitDefinition | undefined {
  return HABIT_DEFINITIONS.find((h) => h.type === type);
}
