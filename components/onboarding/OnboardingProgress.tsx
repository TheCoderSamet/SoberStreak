import { View } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { ThemedText } from '../ui/ThemedText';

export interface OnboardingProgressProps {
  step: number;
  totalSteps?: number;
}

export function OnboardingProgress({ step, totalSteps = 6 }: OnboardingProgressProps) {
  const { colors } = useAppTheme();
  const progress = Math.min(1, step / totalSteps);

  return (
    <View className="mb-5">
      <View className="mb-2 flex-row items-center justify-between">
        <ThemedText variant="primary" className="text-sm font-semibold">
          Step {step} of {totalSteps}
        </ThemedText>
        <ThemedText variant="muted" className="text-xs">
          {Math.round(progress * 100)}%
        </ThemedText>
      </View>
      <View
        className="h-2 overflow-hidden rounded-full"
        style={{ backgroundColor: colors.surface }}
      >
        <View
          className="h-full rounded-full"
          style={{ width: `${progress * 100}%`, backgroundColor: colors.primaryStrong }}
        />
      </View>
    </View>
  );
}
