import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { subDays } from 'date-fns';
import { PageHeader } from '../../components/PageHeader';
import { QuitDateSelector } from '../../components/QuitDateSelector';
import { FormError } from '../../components/FormError';
import { useHabitById } from '../../hooks/useActiveHabit';
import { useAppTheme } from '../../hooks/useAppTheme';
import { quitDateFromPickerDate } from '../../lib/dateMath';
import { scheduleProfileSync } from '../../lib/profileSyncScheduler';
import { getMoneyInputStyle, themedBox } from '../../lib/themeStyles';
import {
  parseMoneyAmount,
  validateDailyCost,
  validateHabitName,
  validateQuitDate,
  validateReason,
} from '../../lib/validation';
import { BackButton } from '../../components/ui/BackButton';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { TextField } from '../../components/ui/TextField';
import { ThemedText } from '../../components/ui/ThemedText';
import { useUserStore } from '../../store/useUserStore';

const DATE_PRESETS = [
  { label: 'Today', daysAgo: 0 },
  { label: 'Yesterday', daysAgo: 1 },
  { label: '7 days ago', daysAgo: 7 },
  { label: '30 days ago', daysAgo: 30 },
] as const;

export default function EditHabitScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, isDark } = useAppTheme();
  const habit = useHabitById(id);
  const profile = useUserStore((s) => s.profile);
  const updateHabit = useUserStore((s) => s.updateHabit);

  const [name, setName] = useState('');
  const [reason, setReason] = useState('');
  const [costText, setCostText] = useState('');
  const [quitDateIso, setQuitDateIso] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!habit || initialized) return;
    setName(habit.name);
    setReason(habit.reason);
    setCostText(String(habit.dailyCost));
    setQuitDateIso(
      habit.quitDate.trim().length > 0
        ? habit.quitDate
        : quitDateFromPickerDate(new Date())
    );
    setInitialized(true);
  }, [habit, initialized]);

  const errors = useMemo(() => {
    const next: {
      name?: string;
      cost?: string;
      quitDate?: string;
      reason?: string;
    } = {};
    const nameErr = validateHabitName(name);
    if (nameErr) next.name = nameErr;
    const costErr = validateDailyCost(costText);
    if (costErr) next.cost = costErr;
    const dateErr = validateQuitDate(quitDateIso);
    if (dateErr) next.quitDate = dateErr;
    const reasonErr = validateReason(reason);
    if (reasonErr) next.reason = reasonErr;
    return next;
  }, [name, costText, quitDateIso, reason]);

  const canSave = Object.keys(errors).length === 0;

  if (!habit) {
    return (
      <ScreenContainer scroll tabBarInset={false}>
        <BackButton onPress={() => router.back()} className="mb-3 self-start" />
        <Card>
          <ThemedText className="text-lg font-semibold">Habit not found</ThemedText>
          <ThemedText variant="muted" className="mt-2 text-sm leading-5">
            This habit may have been removed from your device.
          </ThemedText>
          <View className="mt-4">
            <Button
              title="Back to Manage Habits"
              onPress={() => router.replace('/manage-habits' as Href)}
            />
          </View>
        </Card>
      </ScreenContainer>
    );
  }

  const handleSave = () => {
    setSubmitted(true);
    if (!canSave || !quitDateIso) return;

    const parsedCost = parseMoneyAmount(costText);
    if (parsedCost === null) return;

    updateHabit(habit.id, {
      name: name.trim(),
      reason: reason.trim(),
      dailyCost: parsedCost,
      quitDate: quitDateIso,
    });

    scheduleProfileSync();
    router.back();
  };

  const originalQuitIso =
    habit.quitDate.trim().length > 0 ? habit.quitDate : quitDateFromPickerDate(new Date());

  const show = (field: keyof typeof errors) => (submitted ? errors[field] : undefined);

  return (
    <ScreenContainer scroll keyboardAware tabBarInset={false}>
      <BackButton onPress={() => router.back()} className="mb-3 self-start" />

      <PageHeader title="Edit habit" subtitle={`Update ${habit.name}`} />

      <Card title="Habit name">
        <TextField value={name} onChangeText={setName} placeholder="Habit name" error={show('name')} />
      </Card>

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

      <Card className="mt-4" title="Quit date">
        <View className="mb-4 flex-row flex-wrap gap-2">
          <Pressable
            onPress={() => setQuitDateIso(originalQuitIso)}
            className="rounded-2xl px-3.5 py-2"
            style={themedBox(colors, isDark, {
              selected: quitDateIso === originalQuitIso,
              accent: quitDateIso === originalQuitIso ? 'primary' : 'neutral',
              fill: 'card',
            })}
          >
            <ThemedText
              className="text-sm font-medium"
              style={{
                color: quitDateIso === originalQuitIso ? colors.primaryStrong : colors.text,
              }}
            >
              Keep current date
            </ThemedText>
          </Pressable>
          {DATE_PRESETS.map((preset) => {
            const iso = quitDateFromPickerDate(subDays(new Date(), preset.daysAgo));
            const selected = quitDateIso === iso;
            return (
              <Pressable
                key={preset.label}
                onPress={() => setQuitDateIso(iso)}
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
          title="Save changes"
          variant={canSave ? 'primary' : 'secondary'}
          disabled={submitted && !canSave}
          onPress={handleSave}
        />
      </View>
    </ScreenContainer>
  );
}
