import { isAfter, isValid, startOfDay } from 'date-fns';

const MAX_DAILY_COST = 10000;
const MAX_NOTE_LENGTH = 1000;

export function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  if (!trimmed.includes('@')) return false;
  const parts = trimmed.split('@');
  if (parts.length !== 2) return false;
  return parts[0].length > 0 && parts[1].includes('.');
}

export function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}

export function isValidMoneyAmount(value: string | number): boolean {
  if (typeof value === 'number') {
    return !Number.isNaN(value) && value >= 0 && value <= MAX_DAILY_COST;
  }
  return parseMoneyAmount(value) !== null;
}

export function parseMoneyAmount(value: string): number | null {
  const trimmed = value.trim().replace(/,/g, '.');
  if (trimmed.length === 0) return null;
  const parsed = parseFloat(trimmed);
  if (Number.isNaN(parsed) || parsed < 0 || parsed > MAX_DAILY_COST) return null;
  return parsed;
}

export function validateHabitName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length === 0) return 'Habit name is required.';
  if (trimmed.length < 2) return 'Habit name must be at least 2 characters.';
  return null;
}

export function validateReason(reason: string): string | null {
  const trimmed = reason.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length < 3) return 'Reason must be at least 3 characters if provided.';
  return null;
}

export function validateDailyCost(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) return 'Daily cost is required.';
  const parsed = parseMoneyAmount(trimmed);
  if (parsed === null) return `Enter a valid amount between 0 and ${MAX_DAILY_COST}.`;
  return null;
}

export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (trimmed.length === 0) return 'Email is required.';
  if (!isValidEmail(trimmed)) return 'Enter a valid email address.';
  return null;
}

export function validateName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length === 0) return 'Name is required.';
  if (trimmed.length < 2) return 'Name must be at least 2 characters.';
  return null;
}

export function validateQuitDate(quitDateIso: string | null): string | null {
  if (!quitDateIso || quitDateIso.trim().length === 0) {
    return 'Please choose a start date.';
  }
  const date = new Date(quitDateIso);
  if (!isValid(date)) return 'Please choose a valid start date.';
  const today = startOfDay(new Date());
  if (isAfter(startOfDay(date), today)) return 'Start date cannot be in the future.';
  return null;
}

export function validateJournalNote(note: string): string | null {
  if (note.length > MAX_NOTE_LENGTH) {
    return `Note must be ${MAX_NOTE_LENGTH} characters or less.`;
  }
  return null;
}

export const JOURNAL_NOTE_MAX_LENGTH = MAX_NOTE_LENGTH;
const MAX_COMMUNITY_TITLE = 120;
const MAX_COMMUNITY_MESSAGE = 2000;

export function validateCommunityTitle(title: string): string | null {
  const trimmed = title.trim();
  if (trimmed.length === 0) return 'Title is required.';
  if (trimmed.length < 3) return 'Title must be at least 3 characters.';
  if (trimmed.length > MAX_COMMUNITY_TITLE) {
    return `Title must be ${MAX_COMMUNITY_TITLE} characters or less.`;
  }
  return null;
}

export function validateCommunityMessage(message: string): string | null {
  const trimmed = message.trim();
  if (trimmed.length === 0) return 'Message is required.';
  if (trimmed.length < 10) return 'Message must be at least 10 characters.';
  if (trimmed.length > MAX_COMMUNITY_MESSAGE) {
    return `Message must be ${MAX_COMMUNITY_MESSAGE} characters or less.`;
  }
  return null;
}

export const DEFAULT_ONBOARDING_REASON = 'I want to build a better routine.';
