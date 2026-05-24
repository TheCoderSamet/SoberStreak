import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { subDays } from 'date-fns';
import { PageHeader } from '../components/PageHeader';
import { PremiumLocked } from '../components/PremiumLocked';
import { QuitDateSelector } from '../components/QuitDateSelector';
import { FormError } from '../components/FormError';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ChipSelector } from '../components/ui/ChipSelector';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { TextField } from '../components/ui/TextField';
import { ThemedText } from '../components/ui/ThemedText';
import { useAppTheme } from '../hooks/useAppTheme';
import { useActiveHabit } from '../hooks/useActiveHabit';
import { calculateSavings, getElapsedDays, quitDateFromPickerDate } from '../lib/dateMath';
import { themedBox } from '../lib/themeStyles';
import { validateQuitDate } from '../lib/validation';
import { useProgressHistoryStore } from '../store/useProgressHistoryStore';
import { useSubscriptionStore } from '../store/useSubscriptionStore';
import { useUserStore } from '../store/useUserStore';
import { ProgressHistoryItem } from '../types';

const REFLECTION_CHIPS = ['Stress', 'Social', 'Boredom', 'Anxiety', 'Routine'];

const DATE_PRESETS = [
  { label: 'Today', daysAgo: 0 },
  { label: 'Yesterday', daysAgo: 1 },
  { label: '7 days ago', daysAgo: 7 },
  { label: '30 days ago', daysAgo: 30 },
] as const;

export default function RelapseScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const isPremium = useSubscriptionStore((s) => s.isPremium);
  const habit = useActiveHabit();

  if (!isPremium) {
    return (
      <PremiumLocked
        showBack
        title="Start again"
        description="Reset your quit date with care and keep your progress history."
        features={[
          'Guided start-again flow',
          'Reflection prompts',
          'Progress history preserved',
        ]}
      />
    );
  }
  const updateHabit = useUserStore((s) => s.updateHabit);
  const addHistoryItem = useProgressHistoryStore((s) => s.addHistoryItem);
  const [quitDateIso, setQuitDateIso] = useState<string | null>(null);
  const [reflectionChips, setReflectionChips] = useState<string[]>([]);
  const [reflection, setReflection] = useState('');
  const [dateError, setDateError] = useState<string | null>(null);

  const toggleReflection = (chip: string) => {
    setReflectionChips((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
    );
  };

  const applyPreset = (daysAgo: number) => {
    setQuitDateIso(quitDateFromPickerDate(subDays(new Date(), daysAgo)));
    setDateError(null);
  };

  if (!habit) {
    return (
      <ScreenContainer scroll tabBarInset={false}>
        <PageHeader
          title="Start Again"
          subtitle="One moment does not erase your effort."
        />
        <Card>
          <ThemedText className="text-lg font-semibold">No habit found</ThemedText>
          <ThemedText variant="muted" className="mt-2 text-sm leading-5">
            Complete onboarding before resetting your quit date.
          </ThemedText>
          <View className="mt-4">
            <Button title="Back to Home" onPress={() => router.replace('/(tabs)')} />
          </View>
        </Card>
      </ScreenContainer>
    );
  }

  const handleReset = () => {
    const err = validateQuitDate(quitDateIso);
    if (err) {
      setDateError(err === 'Please choose a start date.' ? 'Please choose a new start date.' : err);
      return;
    }
    if (!quitDateIso) return;

    const nowIso = new Date().toISOString();
    const trimmedReflection = reflection.trim();
    const hasQuitDate = habit.quitDate.trim().length > 0;

    if (hasQuitDate) {
      const historyItem: ProgressHistoryItem = {
        id: Date.now().toString(),
        habitId: habit.id,
        habitName: habit.name,
        startedAt: habit.quitDate,
        endedAt: nowIso,
        durationDays: getElapsedDays(habit.quitDate),
        estimatedSavings: calculateSavings(habit.quitDate, habit.dailyCost),
        reflection: trimmedReflection.length > 0 ? trimmedReflection : undefined,
        triggers: reflectionChips.length > 0 ? reflectionChips : undefined,
        createdAt: nowIso,
      };
      addHistoryItem(historyItem);
    }

    updateHabit(habit.id, { quitDate: quitDateIso });

    Alert.alert(
      'Your new start date is saved.',
      hasQuitDate
        ? 'Your previous progress was added to history. Journal entries and history are kept.'
        : 'You can keep going from here.',
      [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
    );
  };

  return (
    <ScreenContainer scroll keyboardAware tabBarInset={false}>
      <PageHeader
        title="Start Again"
        subtitle="One moment does not erase your effort."
      />

      <Card title="You are not starting from zero" subtitle="Your effort still matters">
        <ThemedText variant="body" className="text-sm leading-6">
          When you reset, your previous streak can be saved to progress history. Journal entries
          and past history stay saved — only your quit date changes.
        </ThemedText>
      </Card>

      <Card className="mt-4" title="Trigger reflection" subtitle="Optional — saved with this period">
        <ChipSelector
          chips={REFLECTION_CHIPS}
          selected={reflectionChips}
          onToggle={toggleReflection}
          label="Common triggers"
        />
        <View className="mt-4">
          <TextField
            label="Reflection note"
            value={reflection}
            onChangeText={setReflection}
            placeholder="A few words if it helps..."
            multiline
          />
        </View>
      </Card>

      <Card className="mt-4" title="New start date" subtitle="Quick picks or choose a date">
        <View className="mb-4 flex-row flex-wrap gap-2">
          {DATE_PRESETS.map((preset) => {
            const iso = quitDateFromPickerDate(subDays(new Date(), preset.daysAgo));
            const selected = quitDateIso === iso;
            return (
              <Pressable
                key={preset.label}
                onPress={() => applyPreset(preset.daysAgo)}
                className="rounded-2xl px-3.5 py-2"
                style={themedBox(colors, isDark, {
                  selected,
                  accent: selected ? 'primary' : 'neutral',
                  fill: 'card',
                })}
              >
                <ThemedText
                  className="text-sm font-medium"
                  style={{ color: selected ? colors.primaryStrong : colors.text }}
                >
                  {preset.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
        <QuitDateSelector
          quitDateIso={quitDateIso}
          onQuitDateChange={(iso) => {
            setQuitDateIso(iso);
            setDateError(null);
          }}
        />
        <FormError message={dateError} />
      </Card>

      <Card className="mt-4" title="Reset my quit date">
        <ThemedText variant="muted" className="mb-4 text-sm leading-5">
          This updates your streak counter. It does not delete journal entries or progress
          history.
        </ThemedText>
        <Button title="Reset my quit date" variant="primary" onPress={handleReset} />
        <View className="mt-3">
          <Button title="Cancel" variant="secondary" onPress={() => router.back()} />
        </View>
      </Card>
    </ScreenContainer>
  );
}
