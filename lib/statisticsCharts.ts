import { format } from 'date-fns';
import { getSoberDays } from './dateMath';
import { Habit, JournalEntry, ProgressHistoryItem } from '../types';
import { lightPalette } from '../constants/theme';

export const MOOD_CHART_COLORS = {
  great: '#2D9F78',
  good: lightPalette.teal,
  okay: '#5B7A9A',
  hard: '#D9534F',
} as const;

/** Rank palette: lowest savings → red, highest → dark green */
export const SAVINGS_RANK_COLORS = [
  '#D94F45',
  '#EF8A3C',
  '#F5A623',
  '#4ECDC4',
  '#8ED081',
  '#2D9F78',
] as const;

/** @deprecated use SAVINGS_RANK_COLORS — kept for section accents */
export const SAVINGS_CHART_COLORS = SAVINGS_RANK_COLORS;

export function savingsColorForRank(rankIndex: number, totalCount: number): string {
  if (totalCount <= 1) {
    return SAVINGS_RANK_COLORS[SAVINGS_RANK_COLORS.length - 1]!;
  }
  const position = rankIndex / (totalCount - 1);
  const paletteIndex = Math.round(position * (SAVINGS_RANK_COLORS.length - 1));
  return SAVINGS_RANK_COLORS[SAVINGS_RANK_COLORS.length - 1 - paletteIndex]!;
}

export const TRIGGER_CHART_COLORS = [
  '#6C8EBF',
  '#8B7FD4',
  lightPalette.teal,
  '#5B8DEF',
  lightPalette.mid,
  '#9B8FD9',
] as const;

export type MoodKey = keyof typeof MOOD_CHART_COLORS;

export const MOOD_LABELS: Record<MoodKey, string> = {
  great: 'Great',
  good: 'Good',
  okay: 'Okay',
  hard: 'Hard',
};

export interface MoodCounts {
  great: number;
  good: number;
  okay: number;
  hard: number;
}

export interface ChartSlice {
  label: string;
  value: number;
  color: string;
}

export function getDominantMood(counts: MoodCounts): {
  key: MoodKey;
  label: string;
  count: number;
  percent: number;
  total: number;
} | null {
  const total = counts.great + counts.good + counts.okay + counts.hard;
  if (total === 0) return null;

  const entries: { key: MoodKey; count: number }[] = [
    { key: 'great', count: counts.great },
    { key: 'good', count: counts.good },
    { key: 'okay', count: counts.okay },
    { key: 'hard', count: counts.hard },
  ];
  const top = entries.reduce((best, item) => (item.count > best.count ? item : best));
  return {
    key: top.key,
    label: MOOD_LABELS[top.key],
    count: top.count,
    percent: Math.round((top.count / total) * 100),
    total,
  };
}

export function buildMoodPieData(counts: MoodCounts): ChartSlice[] {
  const moodKeys = Object.keys(MOOD_LABELS) as MoodKey[];
  return moodKeys
    .filter((key) => counts[key] > 0)
    .map((key) => ({
      label: MOOD_LABELS[key],
      value: counts[key],
      color: MOOD_CHART_COLORS[key],
    }))
    .sort((a, b) => b.value - a.value);
}

export function aggregateTriggers(
  history: ProgressHistoryItem[],
  journalEntries: JournalEntry[]
): { label: string; count: number }[] {
  const map = new Map<string, number>();

  for (const item of history) {
    for (const trigger of item.triggers ?? []) {
      const key = trigger.trim();
      if (!key) continue;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
  }
  for (const entry of journalEntries) {
    for (const trigger of entry.triggers ?? []) {
      const key = trigger.trim();
      if (!key) continue;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
  }

  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

export function buildTriggerPieData(
  triggers: { label: string; count: number }[]
): ChartSlice[] {
  return triggers.map((item, index) => ({
    label: item.label,
    value: item.count,
    color: TRIGGER_CHART_COLORS[index % TRIGGER_CHART_COLORS.length],
  }));
}

export interface StreakRunRow {
  id: string;
  label: string;
  days: number;
  isCurrent: boolean;
  subtitle?: string;
}

export function buildStreakRuns(
  history: ProgressHistoryItem[],
  currentDays: number
): StreakRunRow[] {
  const rows: StreakRunRow[] = history.map((item) => ({
    id: item.id,
    label: 'Past run',
    days: item.durationDays,
    isCurrent: false,
    subtitle: `${format(new Date(item.startedAt), 'd MMM yyyy')} – ${format(new Date(item.endedAt), 'd MMM yyyy')}`,
  }));

  if (currentDays > 0) {
    rows.push({
      id: 'current',
      label: 'Current streak',
      days: currentDays,
      isCurrent: true,
      subtitle: 'In progress',
    });
  }

  return rows.sort((a, b) => b.days - a.days);
}

export function buildStreakRunsCombined(
  habits: Habit[],
  history: ProgressHistoryItem[]
): StreakRunRow[] {
  const rows: StreakRunRow[] = history.map((item) => ({
    id: item.id,
    label: item.habitName,
    days: item.durationDays,
    isCurrent: false,
    subtitle: `${format(new Date(item.startedAt), 'd MMM yyyy')} – ${format(new Date(item.endedAt), 'd MMM yyyy')}`,
  }));

  for (const habit of habits) {
    if (!habit.quitDate) continue;
    const days = getSoberDays(habit.quitDate);
    if (days <= 0) continue;
    rows.push({
      id: `current-${habit.id}`,
      label: habit.name,
      days,
      isCurrent: true,
      subtitle: 'Current streak',
    });
  }

  return rows.sort((a, b) => b.days - a.days);
}

export function buildHabitSavingsPieData(
  habits: { name: string; saved: number }[]
): ChartSlice[] {
  const sorted = habits
    .filter((h) => h.saved > 0)
    .sort((a, b) => b.saved - a.saved);
  const count = sorted.length;

  return sorted.map((habit, rankIndex) => ({
    label: habit.name,
    value: Math.round(habit.saved * 100) / 100,
    color: savingsColorForRank(rankIndex, count),
  }));
}
