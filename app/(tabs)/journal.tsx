import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { HabitDetailPickerSection } from '../../components/habits/HabitDetailPickerSection';
import { useHabitSelection } from '../../hooks/useHabitSelection';
import { useAppTheme } from '../../hooks/useAppTheme';
import { PageHeader } from '../../components/PageHeader';
import { PremiumLocked } from '../../components/PremiumLocked';
import { SettingsSection } from '../../components/SettingsSection';
import { FormError } from '../../components/FormError';
import { themedBox, themedIconWrap } from '../../lib/themeStyles';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { TagChip } from '../../components/ui/TagChip';
import { ChipSelector } from '../../components/ui/ChipSelector';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { TextField } from '../../components/ui/TextField';
import { ThemedText } from '../../components/ui/ThemedText';
import {
  JOURNAL_NOTE_MAX_LENGTH,
  validateJournalNote,
} from '../../lib/validation';
import { useJournalStore } from '../../store/useJournalStore';
import { useSubscriptionStore } from '../../store/useSubscriptionStore';
import { JournalEntry } from '../../types';

type MoodOption = JournalEntry['mood'];

const MOODS: MoodOption[] = ['great', 'good', 'okay', 'hard'];

const TRIGGER_CHIPS = [
  'Stress',
  'Social situation',
  'Boredom',
  'Anxiety',
  'Celebration',
  'Habit routine',
];

const JOURNAL_BENEFITS = [
  { title: 'Mood tracking', description: 'Log how you feel each day with simple mood options.' },
  { title: 'Daily notes', description: 'Capture thoughts in a private journal on your device.' },
  { title: 'Trigger reflection', description: 'Tag what was around difficult moments.' },
  { title: 'Personal progress history', description: 'Review entries to spot patterns over time.' },
];

function moodLabel(mood: MoodOption): string {
  switch (mood) {
    case 'great':
      return 'Great';
    case 'good':
      return 'Good';
    case 'okay':
      return 'Okay';
    case 'hard':
      return 'Hard';
  }
}

export default function JournalScreen() {
  const { colors, isDark } = useAppTheme();
  const isPremium = useSubscriptionStore((s) => s.isPremium);
  const {
    selectedHabit: habit,
    showHabitPicker,
    pickerHabits,
    selectedHabitId,
    setActiveHabit,
    currency,
    hasAnyHabit,
    pickerNote,
  } = useHabitSelection();
  const entries = useJournalStore((s) => s.entries);
  const addEntry = useJournalStore((s) => s.addEntry);
  const deleteEntry = useJournalStore((s) => s.deleteEntry);

  const [mood, setMood] = useState<MoodOption | null>(null);
  const [note, setNote] = useState('');
  const [triggers, setTriggers] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [moodError, setMoodError] = useState<string | null>(null);

  if (!isPremium) {
    return (
      <PremiumLocked
        title="Journal"
        description="A private space for mood, notes, and reflection."
        benefitCards={JOURNAL_BENEFITS}
        tabBarInset
      />
    );
  }

  if (!hasAnyHabit || !habit) {
    return (
      <ScreenContainer scroll>
        <PageHeader title="Journal" subtitle="Track how you feel today." />
        <Card>
          <ThemedText className="text-lg font-semibold">No habit found</ThemedText>
          <ThemedText variant="muted" className="mt-2 text-sm leading-5">
            Complete onboarding to use the journal.
          </ThemedText>
        </Card>
      </ScreenContainer>
    );
  }

  const toggleTrigger = (chip: string) => {
    setTriggers((prev) =>
      prev.includes(chip) ? prev.filter((t) => t !== chip) : [...prev, chip]
    );
  };

  const handleSave = () => {
    const trimmed = note.trim();
    const noteErr = validateJournalNote(note);

    if (!mood && !trimmed) {
      setFormError('Choose a mood or write a note first.');
      setMoodError(null);
      return;
    }
    if (noteErr) {
      setFormError(noteErr);
      return;
    }
    if (!mood) {
      setMoodError('Choose a mood to save your entry.');
      setFormError(null);
      return;
    }

    const nowIso = new Date().toISOString();
    addEntry({
      id: Date.now().toString(),
      habitId: habit.id,
      date: nowIso,
      mood,
      note: trimmed,
      triggers: triggers.length > 0 ? triggers : undefined,
      createdAt: nowIso,
    });
    setMood(null);
    setNote('');
    setTriggers([]);
    setFormError(null);
    setMoodError(null);
    Alert.alert('Saved', 'Journal entry saved.');
  };

  const handleDelete = (entryId: string) => {
    Alert.alert('Delete entry?', 'This removes the entry from your device.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteEntry(entryId) },
    ]);
  };

  const entriesForHabit = entries.filter((entry) => entry.habitId === habit.id);

  return (
    <ScreenContainer scroll keyboardAware>
      <PageHeader title="Journal" subtitle="Track how you feel today." />

      {showHabitPicker ? (
        <HabitDetailPickerSection
          habits={pickerHabits}
          activeHabitId={selectedHabitId}
          currency={currency}
          onSelect={setActiveHabit}
          note={pickerNote}
        />
      ) : null}

      <Card className="mt-4" title="Today's mood" subtitle="Tap one to continue">
        <View className="flex-row flex-wrap gap-2">
          {MOODS.map((option) => {
            const selected = mood === option;
            return (
              <Pressable
                key={option}
                onPress={() => {
                  setMood(option);
                  setMoodError(null);
                  setFormError(null);
                }}
                className="rounded-2xl px-4 py-3"
                style={themedBox(colors, isDark, {
                  selected,
                  accent: selected ? 'success' : 'neutral',
                  fill: 'card',
                })}
              >
                <ThemedText
                  variant={selected ? 'success' : 'body'}
                  className="text-sm font-semibold"
                >
                  {moodLabel(option)}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
        <FormError message={moodError} />
      </Card>

      <Card className="mt-4" title="Reflection" subtitle="Optional note and triggers">
        <TextField
          value={note}
          onChangeText={(text) => {
            setNote(text);
            setFormError(null);
          }}
          placeholder="What's on your mind?"
          error={formError}
          multiline
          maxLength={JOURNAL_NOTE_MAX_LENGTH}
        />
        <ThemedText variant="muted" className="mt-1 text-right text-xs">
          {note.length}/{JOURNAL_NOTE_MAX_LENGTH}
        </ThemedText>
        <ThemedText variant="muted" className="mb-2 mt-4 text-sm font-medium">
          Triggers
        </ThemedText>
        <ChipSelector chips={TRIGGER_CHIPS} selected={triggers} onToggle={toggleTrigger} />
        <View className="mt-4">
          <Button title="Save entry" onPress={handleSave} />
        </View>
      </Card>

      <SettingsSection title="Recent entries" className="mt-4">
        <Card>
          {entriesForHabit.length === 0 ? (
            <View className="py-2">
              <ThemedText className="text-base font-semibold">No journal entries yet</ThemedText>
              <ThemedText variant="muted" className="mt-2 text-sm leading-5">
                Your first note will appear here after you save.
              </ThemedText>
            </View>
          ) : (
            entriesForHabit.map((entry, index) => (
              <View
                key={entry.id}
                className="py-4"
                style={
                  index === entriesForHabit.length - 1
                    ? undefined
                    : { borderBottomWidth: 1, borderBottomColor: colors.border }
                }
              >
                <View className="flex-row items-center justify-between">
                  <View
                    className="rounded-full px-3 py-1"
                    style={themedIconWrap(colors, isDark, 'primary')}
                  >
                    <ThemedText variant="primary" className="text-xs font-semibold">
                      {moodLabel(entry.mood)}
                    </ThemedText>
                  </View>
                  <ThemedText variant="muted" className="text-xs">
                    {new Date(entry.date).toLocaleString()}
                  </ThemedText>
                </View>
                <ThemedText variant="body" className="mt-3 text-sm leading-6">
                  {entry.note.length > 0 ? entry.note : 'No note provided.'}
                </ThemedText>
                {entry.triggers && entry.triggers.length > 0 ? (
                  <View className="mt-3 flex-row flex-wrap gap-1.5">
                    {entry.triggers.map((trigger) => (
                      <TagChip key={trigger} label={trigger} />
                    ))}
                  </View>
                ) : null}
                <View className="mt-3">
                  <Button
                    title="Delete entry"
                    variant="ghost"
                    onPress={() => handleDelete(entry.id)}
                  />
                </View>
              </View>
            ))
          )}
        </Card>
      </SettingsSection>
    </ScreenContainer>
  );
}
