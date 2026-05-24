import { differenceInSeconds, isAfter, isValid, startOfDay, subDays } from 'date-fns';

export type QuitDatePreset = 'today' | 'yesterday' | 'week' | 'month';

export interface StreakBreakdown {
  totalSeconds: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const EMPTY_STREAK: StreakBreakdown = {
  totalSeconds: 0,
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
};

export function calculateStreak(quitDateIso: string): StreakBreakdown {
  if (!quitDateIso.trim()) return EMPTY_STREAK;

  const quitDate = new Date(quitDateIso);
  if (!isValid(quitDate)) return EMPTY_STREAK;

  const now = new Date();
  if (isAfter(quitDate, now)) return EMPTY_STREAK;

  const totalSeconds = Math.max(0, differenceInSeconds(now, quitDate));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { totalSeconds, days, hours, minutes, seconds };
}

export function calculateSavings(quitDateIso: string, dailyCost: number): number {
  if (!quitDateIso.trim()) return 0;

  const quitDate = new Date(quitDateIso);
  if (!isValid(quitDate)) return 0;

  const now = new Date();
  if (isAfter(quitDate, now)) return 0;

  const { totalSeconds } = calculateStreak(quitDateIso);
  const days = totalSeconds / 86400;
  return Math.round(days * dailyCost * 100) / 100;
}

export function quitDateFromPreset(preset: QuitDatePreset): string {
  const now = new Date();
  switch (preset) {
    case 'today':
      return startOfDay(now).toISOString();
    case 'yesterday':
      return startOfDay(subDays(now, 1)).toISOString();
    case 'week':
      return startOfDay(subDays(now, 7)).toISOString();
    case 'month':
      return startOfDay(subDays(now, 30)).toISOString();
  }
}

/** Normalize a chosen calendar day to ISO (start of local day). */
export function quitDateFromPickerDate(date: Date): string {
  return startOfDay(date).toISOString();
}

export function getElapsedHours(quitDateIso: string): number {
  if (!quitDateIso.trim()) return 0;

  const quitDate = new Date(quitDateIso);
  if (!isValid(quitDate)) return 0;

  const now = new Date();
  if (isAfter(quitDate, now)) return 0;

  return Math.floor(Math.max(0, differenceInSeconds(now, quitDate)) / 3600);
}

export function getSoberDays(quitDateIso: string): number {
  return getElapsedDays(quitDateIso);
}

/** Whole days since quit date; 0 if quit date is in the future. */
export function getElapsedDays(quitDateIso: string): number {
  if (!quitDateIso.trim()) return 0;

  const quitDate = new Date(quitDateIso);
  if (!isValid(quitDate)) return 0;

  const now = new Date();
  if (isAfter(quitDate, now)) return 0;

  return Math.floor(Math.max(0, differenceInSeconds(now, quitDate)) / 86400);
}

export function formatStreakShort(streak: StreakBreakdown): string {
  if (streak.days >= 1) return `${streak.days}d ${streak.hours}h`;
  if (streak.hours >= 1) return `${streak.hours}h ${streak.minutes}m`;
  return `${streak.minutes}m ${streak.seconds}s`;
}
