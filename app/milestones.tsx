import { View } from 'react-native';
import { useActiveHabit } from '../hooks/useActiveHabit';
import { PageHeader } from '../components/PageHeader';
import { SettingsSection } from '../components/SettingsSection';
import { MilestoneBadge } from '../components/MilestoneBadge';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { StatCard } from '../components/ui/StatCard';
import { ThemedText } from '../components/ui/ThemedText';
import { getSoberDays } from '../lib/dateMath';
import { getDayMilestones } from '../lib/milestones';
import { getNextDayMilestone, getUnlockedMilestoneCount } from '../lib/milestoneProgress';

export default function MilestonesScreen() {
  const habit = useActiveHabit();

  if (!habit?.quitDate) {
    return (
      <ScreenContainer scroll tabBarInset={false}>
        <PageHeader
          title="Milestones"
          subtitle="Celebrate progress as it builds."
        />
        <Card>
          <ThemedText className="text-lg font-semibold">No habit found</ThemedText>
          <ThemedText variant="muted" className="mt-2 text-sm leading-5">
            Complete onboarding to track your milestones.
          </ThemedText>
        </Card>
      </ScreenContainer>
    );
  }

  const soberDays = getSoberDays(habit.quitDate);
  const milestones = getDayMilestones();
  const achievedCount = getUnlockedMilestoneCount(soberDays);
  const nextMilestone = getNextDayMilestone(soberDays);
  const milestoneProgress = nextMilestone
    ? Math.min(1, soberDays / nextMilestone.milestone.requiredDays)
    : 1;

  return (
    <ScreenContainer scroll tabBarInset={false}>
      <PageHeader
        title="Milestones"
        subtitle="Celebrate progress as it builds."
      />

      <Card title="Summary">
        <View className="flex-row flex-wrap gap-3">
          <View className="min-w-[30%] flex-1">
            <StatCard label="Total days" value={`${soberDays}`} />
          </View>
          <View className="min-w-[30%] flex-1">
            <StatCard label="Unlocked" value={`${achievedCount}`} />
          </View>
          <View className="min-w-[30%] flex-1">
            <StatCard label="Total milestones" value={`${milestones.length}`} />
          </View>
        </View>
      </Card>

      {nextMilestone ? (
        <Card className="mt-4" title="Next milestone" subtitle={`Tracking ${habit.name}`}>
          <ThemedText className="text-xl font-bold">{nextMilestone.milestone.title}</ThemedText>
          <ThemedText variant="muted" className="mt-2 text-sm">
            {nextMilestone.daysRemaining === 0
              ? 'Almost there — keep going.'
              : `${nextMilestone.daysRemaining} day${
                  nextMilestone.daysRemaining === 1 ? '' : 's'
                } remaining`}
          </ThemedText>
          <View className="mt-4">
            <ProgressBar
              progress={milestoneProgress}
              label={`${soberDays} of ${nextMilestone.milestone.requiredDays} days`}
            />
          </View>
        </Card>
      ) : (
        <Card className="mt-4" title="All milestones unlocked" subtitle="Incredible commitment">
          <ThemedText variant="muted" className="text-sm leading-5">
            You have reached every milestone in this set. Keep building on your progress.
          </ThemedText>
        </Card>
      )}

      <SettingsSection title="Your badges">
        <View>
          {milestones.map((milestone) => (
            <MilestoneBadge
              key={milestone.id}
              title={milestone.title}
              description={milestone.description}
              requiredDays={milestone.requiredDays}
              unlocked={soberDays >= milestone.requiredDays}
            />
          ))}
        </View>
      </SettingsSection>
    </ScreenContainer>
  );
}
