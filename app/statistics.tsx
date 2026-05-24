import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { Activity, BookOpen, Brain, Clock, TrendingUp, Wallet } from 'lucide-react-native';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { PremiumLocked } from '../components/PremiumLocked';
import {
  MoodChart,
  SavingsByHabitChart,
  TriggersChart,
} from '../components/statistics/StatisticsCharts';
import { StatisticsHero } from '../components/statistics/StatisticsHero';
import { StatisticsSectionCard } from '../components/statistics/StatisticsSectionCard';
import { JournalEntriesTimeline } from '../components/statistics/JournalEntriesTimeline';
import { ProgressHistoryTimeline } from '../components/statistics/ProgressHistoryTimeline';
import { HabitStreakPicker } from '../components/home/HabitStreakPicker';
import { StreakJourneyList } from '../components/statistics/StreakJourneyList';
import { BackButton } from '../components/ui/BackButton';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { StatCard } from '../components/ui/StatCard';
import { ThemedText } from '../components/ui/ThemedText';
import { lightPalette } from '../constants/theme';
import { getAllHabits } from '../lib/habitUtils';
import {
  calculateSavings,
  calculateStreak,
  formatStreakShort,
  getSoberDays,
} from '../lib/dateMath';
import {
  MOOD_CHART_COLORS,
  SAVINGS_RANK_COLORS,
  aggregateTriggers,
  buildStreakRuns,
  buildStreakRunsCombined,
} from '../lib/statisticsCharts';
import { ALL_HABITS_ID, isAllHabitsView } from '../lib/habitScope';
import { useJournalStore } from '../store/useJournalStore';
import { useProgressHistoryStore } from '../store/useProgressHistoryStore';
import { useSubscriptionStore } from '../store/useSubscriptionStore';
import { useUserStore } from '../store/useUserStore';
import { JournalEntry } from '../types';

const STATS_BENEFITS = [
  { title: 'Mood donut', description: 'Gradient donut with dominant mood in the center.' },
  { title: 'Streak ranking', description: 'Runs ranked by length with progress bars.' },
  { title: 'Trigger donut', description: 'See which triggers dominate your reflections.' },
  { title: 'Savings split', description: 'Ranked habits from red (low) to green (high).' },
];

function countMoods(entries: JournalEntry[]) {
  return entries.reduce(
    (counts, entry) => {
      counts[entry.mood] += 1;
      return counts;
    },
    { great: 0, good: 0, okay: 0, hard: 0 }
  );
}

export default function StatisticsScreen() {
  const router = useRouter();
  const isPremium = useSubscriptionStore((s) => s.isPremium);
  const profile = useUserStore((s) => s.profile);
  const allHabits = getAllHabits(profile);
  const defaultHabitId =
    profile.activeHabitId ?? profile.primaryHabit?.id ?? allHabits[0]?.id;
  const initialSelection =
    allHabits.length > 1 ? ALL_HABITS_ID : defaultHabitId;

  const [selectedId, setSelectedId] = useState<string | undefined>(initialSelection);

  const isAllView = isAllHabitsView(selectedId);

  useEffect(() => {
    if (allHabits.length === 0) return;

    if (isAllHabitsView(selectedId)) {
      if (allHabits.length <= 1) setSelectedId(defaultHabitId);
      return;
    }

    if (selectedId && allHabits.some((h) => h.id === selectedId)) return;

    setSelectedId(allHabits.length > 1 ? ALL_HABITS_ID : defaultHabitId);
  }, [allHabits, defaultHabitId, selectedId]);

  const habit = useMemo(() => {
    if (isAllView) return undefined;
    return allHabits.find((h) => h.id === selectedId) ?? allHabits[0];
  }, [allHabits, isAllView, selectedId]);

  const habitIds = useMemo(() => {
    if (isAllView) return allHabits.map((h) => h.id);
    return habit ? [habit.id] : [];
  }, [allHabits, habit, isAllView]);

  const habitNameMap = useMemo(
    () => Object.fromEntries(allHabits.map((h) => [h.id, h.name])),
    [allHabits]
  );

  const currency = profile.currency;
  const allEntries = useJournalStore((s) => s.entries);
  const progressHistory = useProgressHistoryStore((s) => s.history);

  const scopedEntries = useMemo(
    () => allEntries.filter((entry) => habitIds.includes(entry.habitId)),
    [allEntries, habitIds]
  );

  const habitHistory = useMemo(
    () =>
      progressHistory
        .filter((item) => habitIds.includes(item.habitId))
        .sort((a, b) => b.durationDays - a.durationDays),
    [progressHistory, habitIds]
  );

  const moodCounts = useMemo(() => countMoods(scopedEntries), [scopedEntries]);
  const latestEntries = useMemo(
    () =>
      [...scopedEntries]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3),
    [scopedEntries]
  );
  const triggerStats = useMemo(
    () => aggregateTriggers(habitHistory, scopedEntries),
    [habitHistory, scopedEntries]
  );

  const habitsSavings = useMemo(
    () =>
      allHabits
        .map((h) => ({
          name: h.name,
          saved: h.quitDate ? calculateSavings(h.quitDate, h.dailyCost) : 0,
        }))
        .sort((a, b) => b.saved - a.saved),
    [allHabits]
  );

  const heroStats = useMemo(() => {
    if (isAllView) {
      const moneySaved = allHabits.reduce(
        (sum, h) => sum + (h.quitDate ? calculateSavings(h.quitDate, h.dailyCost) : 0),
        0
      );
      const activeStreaks = allHabits.filter((h) => h.quitDate && getSoberDays(h.quitDate) > 0);
      const longest = activeStreaks.reduce<{ habit: (typeof allHabits)[0] | null; days: number }>(
        (best, h) => {
          const days = getSoberDays(h.quitDate!);
          return days > best.days ? { habit: h, days } : best;
        },
        { habit: null, days: 0 }
      );

      const historyBest = habitHistory.reduce(
        (max, item) => Math.max(max, item.durationDays),
        0
      );
      const currentBest = activeStreaks.reduce(
        (max, h) => Math.max(max, getSoberDays(h.quitDate!)),
        0
      );

      return {
        title: 'All habits',
        streakLabel: longest.habit
          ? `Longest · ${longest.habit.name} · ${formatStreakShort(calculateStreak(longest.habit.quitDate!))}`
          : `${activeStreaks.length} active streak${activeStreaks.length === 1 ? '' : 's'}`,
        moneySaved,
        bestStreakDays: Math.max(historyBest, currentBest),
        journalCount: scopedEntries.length,
        totalDays: allHabits.reduce(
          (sum, h) => sum + (h.quitDate ? getSoberDays(h.quitDate) : 0),
          0
        ),
        totalAttempts: allHabits.reduce(
          (sum, h) =>
            sum + progressHistory.filter((item) => item.habitId === h.id).length + 1,
          0
        ),
      };
    }

    const totalDays = habit?.quitDate ? getSoberDays(habit.quitDate) : 0;
    const historyBest = habitHistory.reduce(
      (max, item) => Math.max(max, item.durationDays),
      0
    );

    return {
      title: habit?.name ?? 'Statistics',
      streakLabel: habit?.quitDate
        ? formatStreakShort(calculateStreak(habit.quitDate))
        : 'Not set',
      moneySaved: habit?.quitDate ? calculateSavings(habit.quitDate, habit.dailyCost) : 0,
      bestStreakDays: Math.max(historyBest, totalDays),
      journalCount: scopedEntries.length,
      totalDays,
      totalAttempts: habitHistory.length + 1,
    };
  }, [
    allHabits,
    habit,
    habitHistory,
    isAllView,
    progressHistory,
    scopedEntries.length,
  ]);

  const streakRuns = useMemo(() => {
    if (isAllView) return buildStreakRunsCombined(allHabits, habitHistory);
    return buildStreakRuns(habitHistory, heroStats.totalDays);
  }, [allHabits, habitHistory, heroStats.totalDays, isAllView]);

  if (!isPremium) {
    return (
      <PremiumLocked
        showBack
        title="Statistics"
        description="Premium insights with colorful charts for moods, streaks, triggers, and savings."
        benefitCards={STATS_BENEFITS}
      />
    );
  }

  if (allHabits.length === 0) {
    return (
      <ScreenContainer scroll tabBarInset={false}>
        <BackButton onPress={() => router.back()} className="mb-3 self-start" />
        <PageHeader title="Statistics" subtitle="Visual insights for your progress." />
        <EmptyState
          title="No habit found"
          message="Complete onboarding first to see your statistics."
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll tabBarInset={false}>
      <BackButton onPress={() => router.back()} className="mb-3 self-start" />

      <PageHeader
        title="Statistics"
        subtitle={
          allHabits.length > 1
            ? 'All or swipe a habit — charts update for your selection.'
            : 'Premium charts built from your streak, journal, and history.'
        }
      />

      <View className="-mx-1 mb-4">
        <HabitStreakPicker
          habits={allHabits}
          activeHabitId={selectedId}
          currency={currency}
          onSelect={setSelectedId}
          showAllOption
        />
      </View>

      <StatisticsHero
        habitName={heroStats.title}
        streakLabel={heroStats.streakLabel}
        moneySaved={heroStats.moneySaved}
        currency={currency}
        bestStreakDays={heroStats.bestStreakDays}
        journalCount={heroStats.journalCount}
      />

      <StatisticsSectionCard
        accentColor={MOOD_CHART_COLORS.good}
        icon={Activity}
        title="Mood breakdown"
        subtitle="Gradient donut · tap slices to focus"
      >
        <MoodChart counts={moodCounts} />
      </StatisticsSectionCard>

      <StatisticsSectionCard
        accentColor={lightPalette.teal}
        icon={TrendingUp}
        title="Streak journey"
        subtitle={
          isAllView
            ? 'All habits · longest runs first'
            : 'Longest runs first · bars show relative length'
        }
      >
        <StreakJourneyList
          history={habitHistory}
          currentDays={isAllView ? 0 : heroStats.totalDays}
          runsOverride={streakRuns}
        />
        <View className="mt-4 flex-row flex-wrap gap-3">
          <View className="min-w-[46%] flex-1">
            <StatCard label="Total attempts" value={String(heroStats.totalAttempts)} />
          </View>
          <View className="min-w-[46%] flex-1">
            <StatCard
              label={isAllView ? 'Combined days' : 'Total days'}
              value={
                heroStats.totalDays === 1
                  ? '1 day'
                  : `${heroStats.totalDays} days`
              }
            />
          </View>
        </View>
      </StatisticsSectionCard>

      <StatisticsSectionCard
        accentColor={lightPalette.mid}
        icon={Brain}
        title="Trigger patterns"
        subtitle="Top triggers from journal and start-again notes"
      >
        <TriggersChart triggers={triggerStats} />
      </StatisticsSectionCard>

      {allHabits.length > 1 ? (
        <StatisticsSectionCard
          accentColor={SAVINGS_RANK_COLORS[5]}
          icon={Wallet}
          title="Savings by habit"
          subtitle="Ranked high → low · red to green by savings"
        >
          <SavingsByHabitChart habits={habitsSavings} currency={currency} />
        </StatisticsSectionCard>
      ) : null}

      <StatisticsSectionCard
        accentColor={MOOD_CHART_COLORS.okay}
        icon={BookOpen}
        title="Latest journal"
        subtitle="Timeline · newest at top"
        className="mt-2"
      >
        {latestEntries.length === 0 ? (
          <ThemedText variant="muted" className="text-sm leading-5">
            Your mood timeline will appear here after you save journal entries.
          </ThemedText>
        ) : (
          <JournalEntriesTimeline
            entries={latestEntries}
            showHabitName={isAllView}
            habitNames={habitNameMap}
          />
        )}
      </StatisticsSectionCard>

      <StatisticsSectionCard
        accentColor={lightPalette.teal}
        icon={Clock}
        title="Progress history"
        subtitle="Timeline · longest runs first"
        className="mt-2"
      >
        {habitHistory.length === 0 ? (
          <ThemedText variant="muted" className="text-sm leading-5">
            Past attempts appear here when you start again.
          </ThemedText>
        ) : (
          <ProgressHistoryTimeline items={habitHistory} currency={currency} />
        )}
      </StatisticsSectionCard>
    </ScreenContainer>
  );
}
