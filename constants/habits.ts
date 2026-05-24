import { HabitType } from '../types';

export interface HabitDefinition {
  type: HabitType;
  name: string;
  icon: string;
  defaultUnit: string;
  defaultDailyCost: number;
  description: string;
  cardDescription: string;
}

export const HABIT_DEFINITIONS: HabitDefinition[] = [
  {
    type: 'alcohol',
    name: 'Alcohol',
    icon: 'wine',
    defaultUnit: 'drinks',
    defaultDailyCost: 25,
    description: 'Quit drinking',
    cardDescription: 'Track alcohol-free days and savings.',
  },
  {
    type: 'smoking',
    name: 'Smoking',
    icon: 'cigarette',
    defaultUnit: 'cigarettes',
    defaultDailyCost: 35,
    description: 'Quit cigarettes',
    cardDescription: 'Track smoke-free progress.',
  },
  {
    type: 'vaping',
    name: 'Vaping',
    icon: 'wind',
    defaultUnit: 'sessions',
    defaultDailyCost: 15,
    description: 'Quit vaping',
    cardDescription: 'Build distance from vaping.',
  },
  {
    type: 'sugar',
    name: 'Sugar',
    icon: 'candy',
    defaultUnit: 'servings',
    defaultDailyCost: 8,
    description: 'Cut out added sugar',
    cardDescription: 'Reduce added sugar habits.',
  },
  {
    type: 'social_media',
    name: 'Social Media',
    icon: 'smartphone',
    defaultUnit: 'hours',
    defaultDailyCost: 0,
    description: 'Reduce screen time',
    cardDescription: 'Take back your time.',
  },
];

export function getCostExampleLabel(type: HabitType): string {
  const def = HABIT_DEFINITIONS.find((h) => h.type === type);
  if (!def) return '$0/day example';
  if (def.defaultDailyCost === 0) return '$0/day is okay';
  return `$${def.defaultDailyCost}/day example`;
}
