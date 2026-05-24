import type { LucideIcon } from 'lucide-react-native';
import { Candy, Cigarette, PenLine, Smartphone, Target, Wine, Wind } from 'lucide-react-native';
import { getHabitDefinition } from './onboarding';
import type { HabitType } from '../types';

const ICON_MAP: Record<string, LucideIcon> = {
  wine: Wine,
  cigarette: Cigarette,
  wind: Wind,
  candy: Candy,
  smartphone: Smartphone,
};

export function getHabitLucideIcon(type: HabitType): LucideIcon {
  const definition = getHabitDefinition(type);
  if (!definition) {
    return type === 'custom' ? PenLine : Target;
  }
  return ICON_MAP[definition.icon] ?? Target;
}
