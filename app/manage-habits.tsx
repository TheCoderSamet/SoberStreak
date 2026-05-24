import { Href, useRouter } from 'expo-router';
import { format } from 'date-fns';
import { Alert, View } from 'react-native';
import { PageHeader } from '../components/PageHeader';
import { SettingsSection } from '../components/SettingsSection';
import { useAppTheme } from '../hooks/useAppTheme';
import { useAllHabits, useActiveHabit } from '../hooks/useActiveHabit';
import { softDeleteHabitOnServer } from '../lib/habitSync';
import { scheduleProfileSync } from '../lib/profileSyncScheduler';
import { BackButton } from '../components/ui/BackButton';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { ThemedText } from '../components/ui/ThemedText';
import {
  calculateSavings,
  calculateStreak,
  formatStreakShort,
} from '../lib/dateMath';
import { getTotalHabitCount } from '../lib/habits';
import { themedBox } from '../lib/themeStyles';
import { useSubscriptionStore } from '../store/useSubscriptionStore';
import { useUserStore } from '../store/useUserStore';
import { Habit } from '../types';

function HabitManageCard({
  habit,
  isActive,
  currency,
  onViewDetails,
  onSetActive,
  onDelete,
}: {
  habit: Habit;
  isActive: boolean;
  currency: string;
  onViewDetails: () => void;
  onSetActive: () => void;
  onDelete: () => void;
}) {
  const { colors, isDark } = useAppTheme();
  const quitLabel =
    habit.quitDate && habit.quitDate.length > 0
      ? format(new Date(habit.quitDate), 'd MMM yyyy')
      : 'Not set';
  const hasQuitDate = habit.quitDate.trim().length > 0;
  const streakLabel = hasQuitDate
    ? formatStreakShort(calculateStreak(habit.quitDate))
    : 'Not started';
  const moneySaved = hasQuitDate ? calculateSavings(habit.quitDate, habit.dailyCost) : 0;

  return (
    <Card className="mb-3">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-2">
          <ThemedText className="text-lg font-semibold">{habit.name}</ThemedText>
          {isActive ? (
            <View
              className="mt-2 self-start rounded-full px-2.5 py-0.5"
              style={themedBox(colors, isDark, { accent: 'success', selected: true })}
            >
              <ThemedText variant="success" className="text-xs font-semibold">
                Active
              </ThemedText>
            </View>
          ) : null}
        </View>
      </View>

      <ThemedText variant="muted" className="mt-3 text-sm">
        Quit date: {quitLabel}
      </ThemedText>
      <ThemedText variant="muted" className="mt-1 text-sm">
        Streak: {streakLabel} · {currency} ${moneySaved.toFixed(2)} saved
      </ThemedText>
      <ThemedText variant="muted" className="mt-1 text-sm">
        Daily cost: {currency} ${habit.dailyCost.toFixed(2)}
      </ThemedText>

      <View className="mt-4 gap-2">
        <Button title="View details" variant="secondary" onPress={onViewDetails} />
        {!isActive ? (
          <Button title="Set active" variant="primary" onPress={onSetActive} />
        ) : (
          <ThemedText variant="muted" className="text-center text-sm">
            Shown on Home.
          </ThemedText>
        )}
        <Button title="Delete habit" variant="danger" onPress={onDelete} />
      </View>
    </Card>
  );
}

export default function ManageHabitsScreen() {
  const router = useRouter();
  const profile = useUserStore((s) => s.profile);
  const isPremium = useSubscriptionStore((s) => s.isPremium);
  const setActiveHabit = useUserStore((s) => s.setActiveHabit);
  const deleteHabit = useUserStore((s) => s.deleteHabit);
  const activeHabit = useActiveHabit();
  const allHabits = useAllHabits();
  const total = getTotalHabitCount(profile);

  const handleAddAnother = () => {
    if (isPremium) {
      router.push('/add-habit');
      return;
    }
    router.push('/paywall');
  };

  const confirmDelete = (habit: Habit) => {
    Alert.alert(
      'Delete habit?',
      `Remove "${habit.name}" from your account? Journal entries may still reference it.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void softDeleteHabitOnServer(habit.id);
            deleteHabit(habit.id);
            scheduleProfileSync();
          },
        },
      ]
    );
  };

  if (allHabits.length === 0) {
    return (
      <ScreenContainer scroll tabBarInset={false}>
        <BackButton onPress={() => router.back()} className="mb-3 self-start" />
        <PageHeader title="My Habits" subtitle="Track your focus habits." />
        <Card>
          <ThemedText className="text-lg font-semibold">No habits yet</ThemedText>
          <ThemedText variant="muted" className="mt-2 text-sm leading-5">
            Add a habit to start tracking, or review onboarding from Settings → Data & Privacy.
          </ThemedText>
          <View className="mt-4 gap-3">
            {isPremium ? (
              <Button title="Add habit" variant="primary" onPress={() => router.push('/add-habit')} />
            ) : (
              <Button
                title="Set up new habit"
                variant="primary"
                onPress={() => router.replace('/(onboarding)/habit')}
              />
            )}
            <Button title="Back" variant="secondary" onPress={() => router.back()} />
          </View>
        </Card>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll tabBarInset={false}>
      <BackButton onPress={() => router.back()} className="mb-3 self-start" />

      <PageHeader
        title="My Habits"
        subtitle={
          isPremium
            ? 'Premium: track multiple habits on this account.'
            : 'Free plan: one habit included. Upgrade for multiple habits.'
        }
      />

      <Card title="Plan limit" className="mb-1">
        <ThemedText className="text-base font-semibold">
          {isPremium ? 'Multiple habits unlocked' : '1 habit included'}
        </ThemedText>
        <ThemedText variant="muted" className="mt-2 text-sm">
          {total} habit{total === 1 ? '' : 's'}
          {activeHabit ? ` · Active: ${activeHabit.name}` : ''}
        </ThemedText>
      </Card>

      <SettingsSection title="All habits" className="mt-10">
        {allHabits.map((habit) => (
          <HabitManageCard
            key={habit.id}
            habit={habit}
            isActive={activeHabit?.id === habit.id}
            currency={profile.currency}
            onViewDetails={() => router.push(`/habit/${habit.id}` as Href)}
            onSetActive={() => {
              setActiveHabit(habit.id);
              scheduleProfileSync();
              router.replace('/(tabs)');
            }}
            onDelete={() => confirmDelete(habit)}
          />
        ))}
      </SettingsSection>

      <View className="mt-2 gap-3 pb-8">
        <Button
          title={isPremium ? 'Add another habit' : 'Unlock multiple habits'}
          variant="primary"
          onPress={handleAddAnother}
        />
        {!isPremium ? (
          <ThemedText variant="muted" className="text-center text-xs leading-5">
            Free plan: 1 habit. Get Premium to add more habits here.
          </ThemedText>
        ) : null}
      </View>
    </ScreenContainer>
  );
}
