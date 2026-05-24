export interface DayMilestone {
  id: string;
  title: string;
  description: string;
  requiredDays: number;
}

export const DAY_MILESTONES: DayMilestone[] = [
  {
    id: '1-day',
    title: 'First Day',
    description: 'You completed your first day.',
    requiredDays: 1,
  },
  {
    id: '7-days',
    title: 'One Week',
    description: 'Seven days of progress.',
    requiredDays: 7,
  },
  {
    id: '30-days',
    title: 'One Month',
    description: 'A full month of effort.',
    requiredDays: 30,
  },
  {
    id: '90-days',
    title: 'Three Months',
    description: 'Your new routine is getting stronger.',
    requiredDays: 90,
  },
  {
    id: '365-days',
    title: 'One Year',
    description: 'One year of meaningful progress.',
    requiredDays: 365,
  },
];

export function getDayMilestones(): DayMilestone[] {
  return DAY_MILESTONES;
}

/** First milestone not yet reached; null if all are unlocked. */
export function getNextMilestone(currentDays: number): DayMilestone | null {
  const next = DAY_MILESTONES.find((m) => currentDays < m.requiredDays);
  return next ?? null;
}
