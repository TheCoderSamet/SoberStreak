import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { subDays } from 'date-fns';
import { HABIT_DEFINITIONS } from '../constants/habits';
import { PageHeader } from '../components/PageHeader';
import { PremiumLocked } from '../components/PremiumLocked';
import { SettingsSection } from '../components/SettingsSection';
import { FormError } from '../components/FormError';
import { useAppTheme } from '../hooks/useAppTheme';
import { QuitDateSelector } from '../components/QuitDateSelector';
import { BackButton } from '../components/ui/BackButton';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { TextField } from '../components/ui/TextField';
import { ThemedText } from '../components/ui/ThemedText';
import { canAddAnotherHabit, createHabitFromInput } from '../lib/habits';
import { quitDateFromPickerDate } from '../lib/dateMath';
import { scheduleProfileSync } from '../lib/profileSyncScheduler';
import { getMoneyInputStyle, themedBox } from '../lib/themeStyles';
import {
  parseMoneyAmount,
  validateDailyCost,
  validateHabitName,
  validateQuitDate,
  validateReason,
} from '../lib/validation';
import { useSubscriptionStore } from '../store/useSubscriptionStore';
import { useUserStore } from '../store/useUserStore';
import { HabitType } from '../types';

const ADD_HABIT_TYPES: { type: HabitType; label: string }[] = [
  ...HABIT_DEFINITIONS.map((d) => ({ type: d.type, label: d.name })),
  { type: 'custom', label: 'Custom' },
];

const DATE_PRESETS = [
  { label: 'Today', daysAgo: 0 },
  { label: 'Yesterday', daysAgo: 1 },
  { label: '7 days ago', daysAgo: 7 },
] as const;

const ADD_HABIT_BENEFITS = [
  { title: 'Multiple habits', description: 'Track more than one focus with separate streaks.' },
];

export default function AddHabitScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const profile = useUserStore((s) => s.profile);
  const isPremium = useSubscriptionStore((s) => s.isPremium);
  const addAdditionalHabit = useUserStore((s) => s.addAdditionalHabit);
  const setPrimaryHabit = useUserStore((s) => s.setPrimaryHabit);
  const setActiveHabit = useUserStore((s) => s.setActiveHabit);

  const [selectedType, setSelectedType] = useState<HabitType | null>(null);
  const [customName, setCustomName] = useState('');
  const [reason, setReason] = useState('');
  const [costText, setCostText] = useState('');
  const [quitDateIso, setQuitDateIso] = useState<string | null>(() =>
    quitDateFromPickerDate(new Date())
  );
  const [submitted, setSubmitted] = useState(false);

  const hasPrimary = Boolean(profile.primaryHabit);
  const mayAdd = hasPrimary ? canAddAnotherHabit(profile, isPremium) : true;

  const errors = useMemo(() => {
    const next: {
      type?: string;
      customName?: string;
      cost?: string;
      quitDate?: string;
      reason?: string;
    } = {};
    if (!selectedType) next.type = 'Choose a habit type.';
    if (selectedType === 'custom') {
      const nameErr = validateHabitName(customName);
      if (nameErr) next.customName = nameErr;
    }
    const costErr = validateDailyCost(costText);
    if (costErr) next.cost = costErr;
    const dateErr = validateQuitDate(quitDateIso);
    if (dateErr) next.quitDate = dateErr;
    const reasonErr = validateReason(reason);
    if (reasonErr) next.reason = reasonErr;
    return next;
  }, [selectedType, customName, costText, quitDateIso, reason]);

  const canSubmit = mayAdd && Object.keys(errors).length === 0;

  if (!mayAdd) {
    return (
      <PremiumLocked
        showBack
        title="Add habit"
        description="Free plan includes one habit. Get Premium to add more habits."
        benefitCards={ADD_HABIT_BENEFITS}
      />
    );
  }

  const handleAdd = () => {
    if (!selectedType || !quitDateIso) return;
    const parsedCost = parseMoneyAmount(costText);
    if (parsedCost === null) return;

    const habit = createHabitFromInput({
      type: selectedType,
      customName: selectedType === 'custom' ? customName : undefined,
      reason: reason.trim(),
      dailyCost: parsedCost,
      quitDate: quitDateIso,
    });

    if (hasPrimary) {
      addAdditionalHabit(habit);
    } else {
      setPrimaryHabit(habit);
    }
    setActiveHabit(habit.id);
    scheduleProfileSync();
    router.replace('/(tabs)');
  };

  const handlePressAdd = () => {
    setSubmitted(true);
    if (!canSubmit) return;
    handleAdd();
  };

  const applyDatePreset = (daysAgo: number) => {
    setQuitDateIso(quitDateFromPickerDate(subDays(new Date(), daysAgo)));
  };

  const show = (field: keyof typeof errors) => (submitted ? errors[field] : undefined);

  return (
    <ScreenContainer scroll keyboardAware tabBarInset={false}>
      <BackButton onPress={() => router.back()} className="mb-3 self-start" />

      <PageHeader
        title={hasPrimary ? 'Add habit' : 'Create habit'}
        subtitle={
          hasPrimary
            ? 'Track another focus with its own streak, savings, and milestones.'
            : 'Set up a habit to start tracking on Home.'
        }
      />

      <SettingsSection title="Habit type">
        <Card>
          <View className="flex-row flex-wrap gap-2">
            {ADD_HABIT_TYPES.map((option) => {
              const selected = selectedType === option.type;
              return (
                <Pressable
                  key={option.type}
                  onPress={() => setSelectedType(option.type)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
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
                    {option.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
          <FormError message={show('type')} />
        </Card>
      </SettingsSection>

      {selectedType === 'custom' ? (
        <Card className="mt-4">
          <TextField
            label="Custom name"
            value={customName}
            onChangeText={setCustomName}
            placeholder="e.g. Gaming, Shopping"
            error={show('customName')}
          />
        </Card>
      ) : null}

      <Card className="mt-4" title="Your reason" subtitle="Optional">
        <TextField
          value={reason}
          onChangeText={setReason}
          placeholder="Why does this habit matter to you?"
          error={show('reason')}
          multiline
        />
      </Card>

      <Card className="mt-4" title="Daily cost" subtitle={`Amount in ${profile.currency}`}>
        <View
          className="flex-row items-center rounded-2xl"
          style={getMoneyInputStyle(colors, isDark, Boolean(show('cost')))}
        >
          <ThemedText variant="muted" className="pl-4 text-lg">
            $
          </ThemedText>
          <TextInput
            className="flex-1 px-3 py-4 text-xl font-semibold"
            style={{ color: colors.text }}
            placeholder="0.00"
            placeholderTextColor={colors.mutedText}
            value={costText}
            onChangeText={setCostText}
            keyboardType="decimal-pad"
          />
        </View>
        <FormError message={show('cost')} />
      </Card>

      <Card className="mt-4" title="Start date">
        <View className="mb-4 flex-row flex-wrap gap-2">
          {DATE_PRESETS.map((preset) => {
            const iso = quitDateFromPickerDate(subDays(new Date(), preset.daysAgo));
            const selected = quitDateIso === iso;
            return (
              <Pressable
                key={preset.label}
                onPress={() => applyDatePreset(preset.daysAgo)}
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
        <QuitDateSelector quitDateIso={quitDateIso} onQuitDateChange={setQuitDateIso} />
        <FormError message={show('quitDate')} />
      </Card>

      <View className="mt-6">
        <Button
          title="Add habit"
          variant={canSubmit ? 'primary' : 'secondary'}
          disabled={submitted && !canSubmit}
          onPress={handlePressAdd}
        />
      </View>
    </ScreenContainer>
  );
}
