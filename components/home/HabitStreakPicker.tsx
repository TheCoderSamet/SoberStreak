import { LayoutGrid } from 'lucide-react-native';
import { Pressable, ScrollView, View } from 'react-native';
import { AppThemeColors } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import {
  calculateSavings,
  calculateStreak,
  formatStreakShort,
  getSoberDays,
} from '../../lib/dateMath';
import { ALL_HABITS_ID } from '../../lib/habitScope';
import { getHabitLucideIcon } from '../../lib/habitIcons';
import { themedBox, themedIconWrap } from '../../lib/themeStyles';
import type { Habit } from '../../types';
import { ThemedText } from '../ui/ThemedText';

export interface HabitStreakPickerProps {
  habits: Habit[];
  activeHabitId: string | undefined;
  currency: string;
  onSelect: (habitId: string) => void;
  showAllOption?: boolean;
}

export function HabitStreakPicker({
  habits,
  activeHabitId,
  currency,
  onSelect,
  showAllOption = false,
}: HabitStreakPickerProps) {
  const { colors, isDark } = useAppTheme();
  const showAll = showAllOption && habits.length > 1;

  const allDays = habits.reduce(
    (sum, h) => sum + (h.quitDate ? getSoberDays(h.quitDate) : 0),
    0
  );
  const allSaved = habits.reduce(
    (sum, h) => sum + (h.quitDate ? calculateSavings(h.quitDate, h.dailyCost) : 0),
    0
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 10, paddingVertical: 4 }}
    >
      {showAll ? (
        <AllCard
          selected={activeHabitId === ALL_HABITS_ID}
          days={allDays}
          saved={allSaved}
          currency={currency}
          onPress={() => onSelect(ALL_HABITS_ID)}
          colors={colors}
          isDark={isDark}
        />
      ) : null}
      {habits.map((habit) => {
        const selected = habit.id === activeHabitId;
        const streak = habit.quitDate ? calculateStreak(habit.quitDate) : null;
        const saved = habit.quitDate ? calculateSavings(habit.quitDate, habit.dailyCost) : 0;
        const Icon = getHabitLucideIcon(habit.type);
        const days = streak?.days ?? 0;

        return (
          <Pressable
            key={habit.id}
            onPress={() => onSelect(habit.id)}
            className="min-w-[140px] rounded-2xl px-3.5 py-3 active:opacity-90"
            style={themedBox(colors, isDark, {
              selected,
              accent: selected ? 'primary' : 'neutral',
            })}
          >
            <View className="flex-row items-center">
              <View
                className="mr-2.5 rounded-xl border p-2"
                style={themedIconWrap(colors, isDark, 'primary')}
              >
                <Icon size={18} color={selected ? colors.primaryStrong : colors.mutedText} />
              </View>
              <View className="min-w-0 flex-1">
                <ThemedText className="text-sm font-semibold" numberOfLines={1}>
                  {habit.name}
                </ThemedText>
                <ThemedText
                  variant={selected ? 'primary' : 'muted'}
                  className="mt-0.5 text-xs font-medium"
                >
                  {streak ? formatStreakShort(streak) : 'No date'}
                </ThemedText>
              </View>
            </View>
            <View className="mt-2 flex-row items-baseline justify-between">
              <ThemedText className="text-2xl font-bold tabular-nums">{days}</ThemedText>
              <ThemedText variant="muted" className="text-[10px]">
                {currency} ${saved.toFixed(0)}
              </ThemedText>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function AllCard({
  selected,
  days,
  saved,
  currency,
  onPress,
  colors,
  isDark,
}: {
  selected: boolean;
  days: number;
  saved: number;
  currency: string;
  onPress: () => void;
  colors: AppThemeColors;
  isDark: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="min-w-[140px] rounded-2xl px-3.5 py-3 active:opacity-90"
      style={themedBox(colors, isDark, {
        selected,
        accent: selected ? 'primary' : 'neutral',
      })}
    >
      <View className="flex-row items-center">
        <View
          className="mr-2.5 rounded-xl border p-2"
          style={themedIconWrap(colors, isDark, 'primary')}
        >
          <LayoutGrid
            size={18}
            color={selected ? colors.primaryStrong : colors.mutedText}
          />
        </View>
        <View className="min-w-0 flex-1">
          <ThemedText className="text-sm font-semibold">All</ThemedText>
          <ThemedText
            variant={selected ? 'primary' : 'muted'}
            className="mt-0.5 text-xs font-medium"
          >
            Combined
          </ThemedText>
        </View>
      </View>
      <View className="mt-2 flex-row items-baseline justify-between">
        <ThemedText className="text-2xl font-bold tabular-nums">{days}</ThemedText>
        <ThemedText variant="muted" className="text-[10px]">
          {currency} ${saved.toFixed(0)}
        </ThemedText>
      </View>
    </Pressable>
  );
}
