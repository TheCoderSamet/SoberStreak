import { View } from 'react-native';
import { getElapsedDays } from '../../lib/dateMath';
import { getNextDayMilestone } from '../../lib/milestoneProgress';
import type { Habit } from '../../types';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { ThemedText } from '../ui/ThemedText';

export interface HabitNextMilestonesProps {
  habits: Habit[];
}

export function HabitNextMilestones({ habits }: HabitNextMilestonesProps) {
  if (habits.length === 0) return null;

  return (
    <View className="gap-3">
      {habits.map((habit) => {
        const days = habit.quitDate ? getElapsedDays(habit.quitDate) : 0;
        const next = getNextDayMilestone(days);
        const progress = next
          ? Math.min(1, days / next.milestone.requiredDays)
          : 1;

        return (
          <Card key={habit.id} subtitle={habit.name}>
            {next ? (
              <>
                <ThemedText className="text-lg font-semibold">{next.milestone.title}</ThemedText>
                <ThemedText variant="muted" className="mt-1 text-sm">
                  {next.daysRemaining === 0
                    ? 'Almost there — keep going.'
                    : `${next.daysRemaining} day${next.daysRemaining === 1 ? '' : 's'} to go`}
                </ThemedText>
                <View className="mt-4">
                  <ProgressBar
                    progress={progress}
                    label={`${days} / ${next.milestone.requiredDays} days`}
                  />
                </View>
              </>
            ) : (
              <ThemedText variant="muted" className="text-sm leading-5">
                All milestones unlocked · {days} day{days === 1 ? '' : 's'}
              </ThemedText>
            )}
          </Card>
        );
      })}
    </View>
  );
}
