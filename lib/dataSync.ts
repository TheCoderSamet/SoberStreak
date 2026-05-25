import { isUuid, newSyncUuid, syncAllHabitsToServer } from './habitSync';
import { supabase } from './supabase';
import { useJournalStore } from '../store/useJournalStore';
import { useProgressHistoryStore } from '../store/useProgressHistoryStore';
import { useSyncStore } from '../store/useSyncStore';
import type { JournalEntry, ProgressHistoryItem } from '../types';

type JournalEntryRow = {
  id: string;
  habit_id: string;
  mood: JournalEntry['mood'];
  note: string | null;
  triggers: string[] | null;
  entry_date: string;
  created_at: string;
};

type ProgressHistoryRow = {
  id: string;
  habit_id: string | null;
  habit_name: string;
  started_at: string;
  ended_at: string;
  duration_days: number;
  estimated_savings: number;
  reflection: string | null;
  triggers: string[] | null;
  created_at: string;
};

function sortJournal(entries: JournalEntry[]): JournalEntry[] {
  return [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

function sortHistory(history: ProgressHistoryItem[]): ProgressHistoryItem[] {
  return [...history].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function mergeJournal(local: JournalEntry[], remote: JournalEntry[]): JournalEntry[] {
  const byId = new Map(local.map((entry) => [entry.id, entry]));
  remote.forEach((entry) => byId.set(entry.id, entry));
  return sortJournal(Array.from(byId.values()));
}

function mergeHistory(
  local: ProgressHistoryItem[],
  remote: ProgressHistoryItem[]
): ProgressHistoryItem[] {
  const byId = new Map(local.map((entry) => [entry.id, entry]));
  remote.forEach((entry) => byId.set(entry.id, entry));
  return sortHistory(Array.from(byId.values()));
}

function mapJournalRow(row: JournalEntryRow): JournalEntry {
  return {
    id: row.id,
    habitId: row.habit_id,
    date: row.entry_date,
    mood: row.mood,
    note: row.note ?? '',
    triggers: row.triggers?.length ? row.triggers : undefined,
    createdAt: row.created_at,
  };
}

function mapProgressRow(row: ProgressHistoryRow): ProgressHistoryItem {
  return {
    id: row.id,
    habitId: row.habit_id ?? '',
    habitName: row.habit_name,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    durationDays: row.duration_days,
    estimatedSavings: Number(row.estimated_savings),
    reflection: row.reflection ?? undefined,
    triggers: row.triggers?.length ? row.triggers : undefined,
    createdAt: row.created_at,
  };
}

async function pushJournalEntries(userId: string): Promise<void> {
  const store = useJournalStore.getState();

  for (const entry of store.entries) {
    if (!isUuid(entry.habitId)) {
      console.warn('[dataSync] Skipping journal entry with unmapped habit:', entry.id);
      continue;
    }

    const remoteId = isUuid(entry.id) ? entry.id : newSyncUuid();
    const { error } = await supabase.from('journal_entries').upsert(
      {
        id: remoteId,
        user_id: userId,
        habit_id: entry.habitId,
        mood: entry.mood,
        note: entry.note.trim().length > 0 ? entry.note : null,
        triggers: entry.triggers ?? [],
        entry_date: entry.date,
        created_at: entry.createdAt,
      },
      { onConflict: 'id' }
    );

    if (error) throw new Error(error.message);
    if (remoteId !== entry.id) {
      useJournalStore.getState().replaceEntryId(entry.id, remoteId);
    }
  }
}

async function pullJournalEntries(userId: string): Promise<void> {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('id, habit_id, mood, note, triggers, entry_date, created_at')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('entry_date', { ascending: false });

  if (error) throw new Error(error.message);

  const remote = ((data ?? []) as JournalEntryRow[]).map(mapJournalRow);
  const local = useJournalStore.getState().entries;
  useJournalStore.getState().setEntries(mergeJournal(local, remote));
}

async function pushProgressHistory(userId: string): Promise<void> {
  const store = useProgressHistoryStore.getState();

  for (const item of store.history) {
    const remoteId = isUuid(item.id) ? item.id : newSyncUuid();
    const { error } = await supabase.from('progress_history').upsert(
      {
        id: remoteId,
        user_id: userId,
        habit_id: isUuid(item.habitId) ? item.habitId : null,
        habit_name: item.habitName,
        started_at: item.startedAt,
        ended_at: item.endedAt,
        duration_days: item.durationDays,
        estimated_savings: item.estimatedSavings,
        reflection: item.reflection ?? null,
        triggers: item.triggers ?? [],
        created_at: item.createdAt,
      },
      { onConflict: 'id' }
    );

    if (error) throw new Error(error.message);
    if (remoteId !== item.id) {
      useProgressHistoryStore.getState().replaceHistoryItemId(item.id, remoteId);
    }
  }
}

async function pullProgressHistory(userId: string): Promise<void> {
  const { data, error } = await supabase
    .from('progress_history')
    .select(
      'id, habit_id, habit_name, started_at, ended_at, duration_days, estimated_savings, reflection, triggers, created_at'
    )
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  const remote = ((data ?? []) as ProgressHistoryRow[]).map(mapProgressRow);
  const local = useProgressHistoryStore.getState().history;
  useProgressHistoryStore.getState().setHistory(mergeHistory(local, remote));
}

export async function softDeleteJournalEntryOnServer(entryId: string): Promise<void> {
  if (!isUuid(entryId)) return;

  const { error } = await supabase
    .from('journal_entries')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', entryId);

  if (error) {
    console.warn('[dataSync] softDeleteJournalEntry:', error.message);
  }
}

export async function syncAllUserData(userId: string): Promise<{ error?: string }> {
  const syncStore = useSyncStore.getState();
  syncStore.startSync();

  try {
    await syncAllHabitsToServer(userId);
    await pushJournalEntries(userId);
    await pushProgressHistory(userId);
    await pullJournalEntries(userId);
    await pullProgressHistory(userId);
    useSyncStore.getState().finishSync();
    return {};
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sync failed';
    console.warn('[dataSync] syncAllUserData:', message);
    useSyncStore.getState().failSync(message);
    return { error: message };
  }
}
