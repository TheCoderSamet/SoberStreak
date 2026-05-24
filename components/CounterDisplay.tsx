import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { lightPalette } from '../constants/theme';
import { useAppTheme } from '../hooks/useAppTheme';
import { calculateSavings, calculateStreak } from '../lib/dateMath';
import { getSurfaceStyle, themedBox } from '../lib/themeStyles';
import { ThemedText } from './ui/ThemedText';

export interface CounterDisplayProps {
  quitDate: string;
  dailyCost: number;
  currency?: string;
}

function TimeUnit({
  value,
  label,
  isDark,
  colors,
}: {
  value: number;
  label: string;
  isDark: boolean;
  colors: ReturnType<typeof useAppTheme>['colors'];
}) {
  return (
    <View
      className="min-w-[68px] flex-1 items-center rounded-2xl px-2 py-3"
      style={{
        borderWidth: isDark ? 1 : 0,
        borderColor: colors.border,
        backgroundColor: isDark ? colors.card : `${lightPalette.teal}10`,
      }}
    >
      <Text className="text-2xl font-bold tabular-nums" style={{ color: colors.text }}>
        {String(value).padStart(2, '0')}
      </Text>
      <Text className="mt-1 text-[10px] font-medium uppercase tracking-wider" style={{ color: colors.mutedText }}>
        {label}
      </Text>
    </View>
  );
}

export function CounterDisplay({ quitDate, dailyCost, currency = 'AUD' }: CounterDisplayProps) {
  const { colors, isDark } = useAppTheme();
  const [streak, setStreak] = useState(() => calculateStreak(quitDate));
  const [savings, setSavings] = useState(() => calculateSavings(quitDate, dailyCost));

  useEffect(() => {
    const tick = () => {
      setStreak(calculateStreak(quitDate));
      setSavings(calculateSavings(quitDate, dailyCost));
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [quitDate, dailyCost]);

  return (
    <View className="rounded-3xl p-5" style={getSurfaceStyle(colors, isDark)}>
      <ThemedText
        variant="primary"
        className="text-center text-xs font-semibold uppercase tracking-widest"
      >
        Your streak
      </ThemedText>

      <View className="mt-4 items-center">
        <Text className="text-7xl font-bold tabular-nums leading-none" style={{ color: colors.text }}>
          {streak.days}
        </Text>
        <ThemedText variant="muted" className="mt-2 text-sm font-medium">
          {streak.days === 1 ? 'day' : 'days'} strong
        </ThemedText>
      </View>

      <View className="mt-5 flex-row gap-2">
        <TimeUnit value={streak.hours} label="hrs" isDark={isDark} colors={colors} />
        <TimeUnit value={streak.minutes} label="min" isDark={isDark} colors={colors} />
        <TimeUnit value={streak.seconds} label="sec" isDark={isDark} colors={colors} />
      </View>

      <View
        className="mt-5 rounded-2xl px-4 py-4"
        style={themedBox(colors, isDark, { accent: 'success', selected: true })}
      >
        <ThemedText variant="muted" className="text-center text-xs font-medium uppercase tracking-wide">
          Money saved
        </ThemedText>
        <Text className="mt-1 text-center text-3xl font-bold" style={{ color: colors.secondary }}>
          {currency} ${savings.toFixed(2)}
        </Text>
        <ThemedText variant="muted" className="mt-2 text-center text-xs">
          Based on ${dailyCost.toFixed(2)} per day
        </ThemedText>
      </View>

      <ThemedText variant="muted" className="mt-4 text-center text-sm leading-5">
        Every moment counts. You are building something meaningful.
      </ThemedText>
    </View>
  );
}
