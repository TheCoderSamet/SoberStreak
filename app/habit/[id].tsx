import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import { format } from 'date-fns';
import {
  Award,
  BookOpen,
  Pencil,
  RefreshCw,
  Target,
} from 'lucide-react-native';
import { PageHeader } from '../../components/PageHeader';
import { BackButton } from '../../components/ui/BackButton';
import { SettingRow } from '../../components/SettingRow';
import { SettingsSection } from '../../components/SettingsSection';
import { useActiveHabit, useHabitById } from '../../hooks/useActiveHabit';
import { useAppTheme } from '../../hooks/useAppTheme';
import { themedIconWrap } from '../../lib/themeStyles';
import {
  calculateSavings,
  calculateStreak,
  formatStreakShort,
  getSoberDays,
} from '../../lib/dateMath';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { StatCard } from '../../components/ui/StatCard';
import { ThemedText } from '../../components/ui/ThemedText';
import { useSubscriptionStore } from '../../store/useSubscriptionStore';
import { useUserStore } from '../../store/useUserStore';

export default function HabitDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, isDark } = useAppTheme();
  const profile = useUserStore((s) => s.profile);
  const isPremium = useSubscriptionStore((s) => s.isPremium);
  const habit = useHabitById(id);
  const activeHabit = useActiveHabit();

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

  const isActive = activeHabit?.id === habit.id;
  const currency = profile.currency;
  const hasQuitDate = habit.quitDate.trim().length > 0;
  const streak = hasQuitDate ? calculateStreak(habit.quitDate) : null;
  const totalDays = hasQuitDate ? getSoberDays(habit.quitDate) : 0;
  const moneySaved = hasQuitDate ? calculateSavings(habit.quitDate, habit.dailyCost) : 0;
  const quitLabel = hasQuitDate
    ? format(new Date(habit.quitDate), 'd MMM yyyy')
    : 'Not set';

  return (
    <ScreenContainer scroll tabBarInset={false}>
      <BackButton onPress={() => router.back()} className="mb-3 self-start" />

      <PageHeader title={habit.name} subtitle="Habit details and progress" />

      <Card title="Progress">
        <View className="mb-4 flex-row items-center">
          <View className="mr-3 rounded-2xl p-2.5" style={themedIconWrap(colors, isDark, 'primary')}>
            <Target size={22} color={colors.primaryStrong} />
          </View>
          <ThemedText className="flex-1 text-xl font-bold">{habit.name}</ThemedText>
        </View>
        <View className="flex-row flex-wrap gap-3">
          <View className="min-w-[46%] flex-1">
            <StatCard
              label="Current streak"
              value={streak ? formatStreakShort(streak) : 'Not started'}
            />
          </View>
          <View className="min-w-[46%] flex-1">
            <StatCard
              label="Total days"
              value={hasQuitDate ? `${totalDays} day${totalDays === 1 ? '' : 's'}` : '—'}
            />
          </View>
          <View className="min-w-[46%] flex-1">
            <StatCard
              label="Money saved"
              value={hasQuitDate ? `$${moneySaved.toFixed(2)}` : '—'}
              hint={currency}
            />
          </View>
        </View>
        <ThemedText variant="muted" className="mt-3 text-sm">
          Quit date: {quitLabel}
        </ThemedText>
        <ThemedText variant="muted" className="mt-1 text-sm">
          Daily cost: {currency} ${habit.dailyCost.toFixed(2)}
        </ThemedText>
        {habit.reason.trim().length > 0 ? (
          <ThemedText variant="body" className="mt-3 text-sm leading-5">
            {habit.reason}
          </ThemedText>
        ) : null}
      </Card>

      <SettingsSection title="Quick actions" className="mt-4">
        <Card>
          <SettingRow
            title="Edit Habit"
            subtitle="Name, reason, cost, and start date"
            icon={Pencil}
            onPress={() => router.push(`/edit-habit/${habit.id}` as Href)}
          />
          <SettingRow
            title="View Milestones"
            subtitle="Badges and progress milestones"
            icon={Award}
            onPress={() => router.push('/milestones' as Href)}
          />
          <SettingRow
            title="Journal"
            subtitle={isActive ? 'Mood and reflection' : 'Set as active on My Habits first'}
            icon={BookOpen}
            onPress={() => router.push('/(tabs)/journal' as Href)}
          />
          <SettingRow
            title="Start Again"
            subtitle={isPremium ? 'Reset quit date with care' : 'Premium feature'}
            icon={RefreshCw}
            onPress={() =>
              isPremium ? router.push('/relapse' as Href) : router.push('/paywall' as Href)
            }
            isLast
          />
        </Card>
      </SettingsSection>
    </ScreenContainer>
  );
}
