import { View } from 'react-native';
import { HabitStreakPicker } from '../home/HabitStreakPicker';
import { ThemedText } from '../ui/ThemedText';
import type { Habit } from '../../types';

export interface HabitDetailPickerSectionProps {
  habits: Habit[];
  activeHabitId: string | undefined;
  currency: string;
  onSelect: (habitId: string) => void;
  note: string;
}

export function HabitDetailPickerSection({
  habits,
  activeHabitId,
  currency,
  onSelect,
  note,
}: HabitDetailPickerSectionProps) {
  return (
    <View className="mb-2">
      <ThemedText className="mb-3 text-[17px] font-semibold">Your streaks</ThemedText>
      <HabitStreakPicker
        habits={habits}
        activeHabitId={activeHabitId}
        currency={currency}
        onSelect={onSelect}
        showAllOption={false}
      />
      <ThemedText variant="muted" className="mt-3 text-sm leading-5">
        {note}
      </ThemedText>
    </View>
  );
}
