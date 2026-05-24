export type HabitType =
  | 'alcohol'
  | 'smoking'
  | 'vaping'
  | 'sugar'
  | 'social_media'
  | 'custom';

export interface Habit {
  id: string;
  type: HabitType;
  name: string;
  quitDate: string;
  dailyCost: number;
  reason: string;
  unit: 'drinks' | 'cigarettes' | 'hours' | 'servings' | 'custom';
  createdAt: string;
}

export interface UserProfile {
  hasCompletedOnboarding: boolean;
  primaryHabit: Habit | null;
  additionalHabits: Habit[];
  activeHabitId?: string;
  notificationsEnabled: boolean;
  preferredReminderTime: string;
  currency: string;
}

export interface Milestone {
  id: string;
  habitId: string;
  thresholdDays: number;
  label: string;
  achievedAt: string | null;
}

export interface JournalEntry {
  id: string;
  habitId: string;
  date: string;
  mood: 'great' | 'good' | 'okay' | 'hard';
  note: string;
  triggers?: string[];
  createdAt: string;
}

export interface HealthMilestone {
  id: string;
  thresholdHours: number;
  title: string;
  description: string;
  icon: string;
}

export type SubscriptionStatus = 'free' | 'premium' | 'trial';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ProgressHistoryItem {
  id: string;
  habitId: string;
  habitName: string;
  startedAt: string;
  endedAt: string;
  durationDays: number;
  estimatedSavings: number;
  reflection?: string;
  triggers?: string[];
  createdAt: string;
}
