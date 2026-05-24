import { Href, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import {
  Award,
  BarChart3,
  BookOpen,
  ChevronRight,
  HeartPulse,
  Plus,
  RefreshCw,
  Sparkles,
  Target,
  Users,
} from 'lucide-react-native';
import { HomeHeader } from '../../components/home/HomeHeader';
import { HomeSection } from '../../components/home/HomeSection';
import { HabitNextMilestones } from '../../components/home/HabitNextMilestones';
import { HabitStreakPicker } from '../../components/home/HabitStreakPicker';
import { QuickActionGrid } from '../../components/home/QuickActionGrid';
import { StreakHero } from '../../components/home/StreakHero';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useHabitSelection } from '../../hooks/useHabitSelection';
import { getElapsedDays } from '../../lib/dateMath';
import { getNextMilestone } from '../../lib/milestones';
import { getDailyMotivation } from '../../lib/motivations';
import { useAuthStore } from '../../store/useAuthStore';
import { getDisplayNameFromUser } from '../../lib/authUser';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { ThemedText } from '../../components/ui/ThemedText';
import { useSubscriptionStore } from '../../store/useSubscriptionStore';
import { useUserStore } from '../../store/useUserStore';
import { lightCardShadow, themedIconWrap } from '../../lib/themeStyles';

export default function HomeScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const user = useAuthStore((s) => s.user);
  const isPremium = useSubscriptionStore((s) => s.isPremium);
  const {
    selectedHabit,
    isAllView,
    showHabitPicker,
    homePickerActiveId,
    habitsWithQuit,
    allHabits,
    setActiveHabit,
    currency,
  } = useHabitSelection();
  const todaysFocus = useMemo(() => getDailyMotivation(), []);

  const greetingName = user ? getDisplayNameFromUser(user).split(' ')[0] : 'there';

  const singleHabit = useMemo(() => {
    if (isAllView) return null;
    if (selectedHabit?.quitDate?.trim()) return selectedHabit;
    return habitsWithQuit[0] ?? null;
  }, [isAllView, selectedHabit, habitsWithQuit]);

  const openPremiumFeature = (href: Href) => {
    if (isPremium) {
      router.push(href);
      return;
    }
    router.push('/paywall');
  };

  if (habitsWithQuit.length === 0) {
    return (
      <ScreenContainer scroll>
        <Card>
          <ThemedText className="text-2xl font-bold">Welcome back</ThemedText>
          <ThemedText variant="muted" className="mt-2 text-base leading-6">
            Add a habit to start your streak counter.
          </ThemedText>
          <View className="mt-5 gap-2">
            <Button title="Manage habits" onPress={() => router.push('/manage-habits')} />
            <Button
              title="Open Settings"
              variant="secondary"
              onPress={() => router.push('/(tabs)/settings')}
            />
          </View>
        </Card>
      </ScreenContainer>
    );
  }

  const milestoneHabit = singleHabit ?? habitsWithQuit[0] ?? null;
  const currentDays = milestoneHabit?.quitDate
    ? getElapsedDays(milestoneHabit.quitDate)
    : 0;
  const nextMilestone = !isAllView ? getNextMilestone(currentDays) : null;
  const milestoneProgress = nextMilestone
    ? Math.min(1, currentDays / nextMilestone.requiredDays)
    : 1;
  const daysRemaining = nextMilestone
    ? Math.max(0, nextMilestone.requiredDays - currentDays)
    : 0;

  return (
    <ScreenContainer scroll>
      <HomeHeader greetingName={greetingName} motivation={todaysFocus} />

      {showHabitPicker ? (
        <HomeSection
          title="Your streaks"
          actionLabel="Manage"
          onAction={() => router.push('/manage-habits')}
        >
          <HabitStreakPicker
            habits={habitsWithQuit}
            activeHabitId={homePickerActiveId}
            currency={currency}
            onSelect={setActiveHabit}
            showAllOption
          />
        </HomeSection>
      ) : null}

      <View className={showHabitPicker ? 'mt-2' : ''}>
        <StreakHero
          habit={singleHabit ?? undefined}
          habits={habitsWithQuit}
          currency={currency}
          showAllHabitsHint={showHabitPicker}
          habitCount={allHabits.length}
          isCombinedView={isAllView}
        />
      </View>

      {!isPremium && allHabits.length === 1 ? (
        <Pressable
          onPress={() => router.push('/paywall')}
          className="mt-4 flex-row items-center rounded-2xl px-4 py-3.5 active:opacity-90"
          style={{
            backgroundColor: colors.surface,
            ...(isDark ? { borderWidth: 1, borderColor: colors.border } : lightCardShadow),
          }}
        >
          <View className="mr-3 rounded-xl p-2" style={themedIconWrap(colors, isDark, 'primary')}>
            <Sparkles size={18} color={colors.primary} />
          </View>
          <ThemedText variant="primary" className="flex-1 text-sm font-medium">
            Premium — track multiple habits at once
          </ThemedText>
          <ChevronRight size={18} color={colors.primary} />
        </Pressable>
      ) : null}

      {isPremium ? (
        <Pressable
          onPress={() => router.push('/add-habit')}
          className="mt-4 flex-row items-center justify-center rounded-2xl border border-dashed py-3.5 active:opacity-90"
          style={{ borderColor: `${colors.primary}44`, backgroundColor: colors.surface }}
        >
          <Plus size={18} color={colors.primary} />
          <ThemedText variant="primary" className="ml-2 text-sm font-semibold">
            Add another habit
          </ThemedText>
        </Pressable>
      ) : null}

      {isAllView && habitsWithQuit.length > 0 ? (
        <HomeSection title="Next milestones">
          <HabitNextMilestones habits={habitsWithQuit} />
        </HomeSection>
      ) : nextMilestone ? (
        <View className="mt-5">
          <Card title="Next milestone">
            <ThemedText className="text-lg font-semibold">{nextMilestone.title}</ThemedText>
            <ThemedText variant="muted" className="mt-1 text-sm">
              {daysRemaining === 0
                ? 'Almost there — keep going.'
                : `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} to go`}
            </ThemedText>
            <View className="mt-4">
              <ProgressBar
                progress={milestoneProgress}
                label={`${currentDays} / ${nextMilestone.requiredDays} days`}
              />
            </View>
          </Card>
        </View>
      ) : null}

      <HomeSection title="Quick actions">
        <QuickActionGrid
          actions={[
            {
              title: 'Emergency',
              subtitle: 'Breathing & support',
              icon: HeartPulse,
              accent: 'danger',
              onPress: () => router.push('/emergency'),
            },
            {
              title: 'Milestones',
              subtitle: 'Your badges',
              icon: Award,
              accent: 'success',
              onPress: () => router.push('/milestones'),
            },
          ]}
        />
      </HomeSection>

      <HomeSection title="Habit & Premium">
        <Pressable
          onPress={() =>
            router.push(
              isAllView ? '/manage-habits' : (`/habit/${singleHabit!.id}` as Href)
            )
          }
          className="mb-3 flex-row items-center rounded-2xl px-4 py-4 active:opacity-90"
          style={{
            backgroundColor: colors.surface,
            ...(isDark ? { borderWidth: 1, borderColor: colors.border } : lightCardShadow),
          }}
        >
          <View className="mr-3 rounded-xl p-2.5" style={themedIconWrap(colors, isDark, 'primary')}>
            <Target size={20} color={colors.primary} />
          </View>
          <View className="min-w-0 flex-1">
            <ThemedText className="text-sm font-semibold">
              {isAllView ? 'Manage habits' : 'Habit details'}
            </ThemedText>
            <ThemedText variant="muted" className="mt-0.5 text-xs">
              {isAllView
                ? `${allHabits.length} habits · view & edit`
                : `${singleHabit!.name} · view & edit`}
            </ThemedText>
          </View>
          <ChevronRight size={18} color={colors.mutedText} />
        </Pressable>

        <QuickActionGrid
          actions={[
            {
              title: 'Journal',
              subtitle: 'Mood & notes',
              icon: BookOpen,
              premiumLocked: !isPremium,
              onPress: () => openPremiumFeature('/(tabs)/journal'),
            },
            {
              title: 'Statistics',
              subtitle: 'Charts & progress',
              icon: BarChart3,
              accent: 'success',
              premiumLocked: !isPremium,
              onPress: () => openPremiumFeature('/statistics'),
            },
            {
              title: 'Community',
              subtitle: 'Anonymous support',
              icon: Users,
              premiumLocked: !isPremium,
              onPress: () => openPremiumFeature('/community'),
            },
            {
              title: 'Start again',
              subtitle: 'Reset quit date',
              icon: RefreshCw,
              premiumLocked: !isPremium,
              onPress: () => openPremiumFeature('/relapse'),
            },
          ]}
        />
      </HomeSection>
    </ScreenContainer>
  );
}
