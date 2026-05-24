import { DAY_MILESTONES, DayMilestone, getNextMilestone } from './milestones';

export interface NextMilestoneInfo {
  milestone: DayMilestone;
  daysRemaining: number;
}

export function getNextDayMilestone(soberDays: number): NextMilestoneInfo | null {
  const next = getNextMilestone(soberDays);
  if (!next) return null;
  return {
    milestone: next,
    daysRemaining: Math.max(0, next.requiredDays - soberDays),
  };
}

export { getNextMilestone };

export function getUnlockedMilestoneCount(soberDays: number): number {
  return DAY_MILESTONES.filter((m) => soberDays >= m.requiredDays).length;
}
