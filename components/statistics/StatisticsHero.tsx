import { View } from 'react-native';
import { TrendingUp, Wallet } from 'lucide-react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { lightPalette } from '../../constants/theme';
import { ThemedText } from '../ui/ThemedText';

export interface StatisticsHeroProps {
  habitName: string;
  streakLabel: string;
  moneySaved: number;
  currency: string;
  bestStreakDays: number;
  journalCount: number;
}

export function StatisticsHero({
  habitName,
  streakLabel,
  moneySaved,
  currency,
  bestStreakDays,
  journalCount,
}: StatisticsHeroProps) {
  const { colors, isDark } = useAppTheme();

  const heroStyle = isDark
    ? {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
      }
    : {
        backgroundColor: lightPalette.deep,
      };

  const titleColor = isDark ? colors.text : colors.onAccent;
  const mutedColor = isDark ? colors.mutedText : colors.onAccentMuted;

  return (
    <View className="mb-4 overflow-hidden rounded-3xl p-5" style={heroStyle}>
      <ThemedText
        className="text-xs font-semibold uppercase tracking-wider"
        style={{ color: mutedColor }}
      >
        {habitName} · Insights
      </ThemedText>
      <ThemedText className="mt-2 text-2xl font-bold" style={{ color: titleColor }}>
        {streakLabel}
      </ThemedText>
      <ThemedText className="mt-1 text-sm" style={{ color: mutedColor }}>
        Current streak · Best {bestStreakDays} day{bestStreakDays === 1 ? '' : 's'}
      </ThemedText>

      <View className="mt-5 flex-row gap-3">
        <View
          className="min-w-0 flex-1 flex-row items-center rounded-2xl px-3 py-3"
          style={{
            backgroundColor: isDark ? colors.surface : 'rgba(244, 244, 244, 0.12)',
          }}
        >
          <Wallet size={20} color={isDark ? colors.primary : colors.onAccent} />
          <View className="ml-2.5 min-w-0 flex-1">
            <ThemedText className="text-lg font-bold" style={{ color: titleColor }}>
              ${moneySaved.toFixed(0)}
            </ThemedText>
            <ThemedText className="text-xs" style={{ color: mutedColor }} numberOfLines={1}>
              Saved · {currency}
            </ThemedText>
          </View>
        </View>
        <View
          className="min-w-0 flex-1 flex-row items-center rounded-2xl px-3 py-3"
          style={{
            backgroundColor: isDark ? colors.surface : 'rgba(244, 244, 244, 0.12)',
          }}
        >
          <TrendingUp size={20} color={isDark ? colors.secondary : colors.onAccent} />
          <View className="ml-2.5 min-w-0 flex-1">
            <ThemedText className="text-lg font-bold" style={{ color: titleColor }}>
              {journalCount}
            </ThemedText>
            <ThemedText className="text-xs" style={{ color: mutedColor }}>
              Journal logs
            </ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
}
