import { View } from 'react-native';
import { HabitDetailPickerSection } from '../../components/habits/HabitDetailPickerSection';
import { HealthMilestoneCard } from '../../components/HealthMilestone';
import { PageHeader } from '../../components/PageHeader';
import { SettingsSection } from '../../components/SettingsSection';
import { useHabitSelection } from '../../hooks/useHabitSelection';
import { Card } from '../../components/ui/Card';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { StatCard } from '../../components/ui/StatCard';
import { ThemedText } from '../../components/ui/ThemedText';
import {
  formatThresholdLabel,
  getHealthTimelineForHabit,
  HEALTH_DISCLAIMER,
} from '../../lib/healthData';
import { getElapsedHours, getSoberDays } from '../../lib/dateMath';

export default function HealthScreen() {
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

  if (!hasAnyHabit) {
    return (
      <ScreenContainer scroll>
        <PageHeader title="Health Timeline" subtitle="Wellness milestones for your habit." />
        <Card>
          <ThemedText className="text-lg font-semibold">No habit found</ThemedText>
          <ThemedText variant="muted" className="mt-2 text-sm leading-5">
            Complete onboarding to see your health timeline.
          </ThemedText>
        </Card>
      </ScreenContainer>
    );
  }

  if (!habit) {
    return (
      <ScreenContainer scroll>
        <PageHeader title="Health Timeline" subtitle="Wellness milestones for your habit." />
        <Card>
          <ThemedText className="text-lg font-semibold">No habit found</ThemedText>
          <ThemedText variant="muted" className="mt-2 text-sm leading-5">
            Complete onboarding to see your health timeline.
          </ThemedText>
        </Card>
      </ScreenContainer>
    );
  }

  if (!habit.quitDate.trim()) {
    return (
      <ScreenContainer scroll>
        <PageHeader title="Health Timeline" subtitle="Wellness milestones for your habit." />
        {showHabitPicker ? (
          <HabitDetailPickerSection
            habits={pickerHabits}
            activeHabitId={selectedHabitId}
            currency={currency}
            onSelect={setActiveHabit}
            note={pickerNote}
          />
        ) : null}
        <Card>
          <ThemedText className="text-lg font-semibold">Start date needed</ThemedText>
          <ThemedText variant="muted" className="mt-2 text-sm leading-5">
            Set a quit date for {habit.name} in Settings → Manage Habits → Edit to unlock your
            health timeline.
          </ThemedText>
        </Card>
      </ScreenContainer>
    );
  }

  const elapsedHours = getElapsedHours(habit.quitDate);
  const soberDays = getSoberDays(habit.quitDate);
  const timeline = getHealthTimelineForHabit(habit.type);
  const unlockedCount = timeline.filter((m) => elapsedHours >= m.thresholdHours).length;

  return (
    <ScreenContainer scroll>
      <PageHeader
        title="Health Timeline"
        subtitle={`Wellness milestones for ${habit.name.toLowerCase()}.`}
      />

      {showHabitPicker ? (
        <HabitDetailPickerSection
          habits={pickerHabits}
          activeHabitId={selectedHabitId}
          currency={currency}
          onSelect={setActiveHabit}
          note={pickerNote}
        />
      ) : null}

      <Card className={showHabitPicker ? 'mt-2' : ''}>
        <ThemedText className="text-base font-bold">Please note</ThemedText>
        <ThemedText variant="muted" className="mt-2 text-sm leading-5">
          {HEALTH_DISCLAIMER}
        </ThemedText>
      </Card>

      <Card className="mt-4" title="Progress summary">
        <View className="flex-row flex-wrap gap-3">
          <View className="min-w-[46%] flex-1">
            <StatCard label="Active habit" value={habit.name} />
          </View>
          <View className="min-w-[46%] flex-1">
            <StatCard label="Completed hours" value={`${elapsedHours} h`} />
          </View>
          <View className="min-w-full">
            <StatCard
              label="Completed days"
              value={`${soberDays} day${soberDays === 1 ? '' : 's'}`}
              hint={`${unlockedCount} of ${timeline.length} milestones unlocked`}
            />
          </View>
        </View>
      </Card>

      <SettingsSection title="Timeline" className="mt-4">
        <Card>
          {timeline.map((item, index) => (
            <HealthMilestoneCard
              key={item.id}
              title={item.title}
              description={item.description}
              timeLabel={formatThresholdLabel(item.thresholdHours)}
              unlocked={elapsedHours >= item.thresholdHours}
              embedded
              isLast={index === timeline.length - 1}
            />
          ))}
        </Card>
      </SettingsSection>
    </ScreenContainer>
  );
}
