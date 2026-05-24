import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { Flame, LayoutGrid } from 'lucide-react-native';
import { lightPalette } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import { calculateSavings, calculateStreak, getSoberDays } from '../../lib/dateMath';
import { getHabitLucideIcon } from '../../lib/habitIcons';
import { lightCardShadow, themedIconWrap } from '../../lib/themeStyles';
import type { Habit } from '../../types';
import { ThemedText } from '../ui/ThemedText';

export interface StreakHeroProps {
  habit?: Habit;
  habits?: Habit[];
  currency: string;
  showAllHabitsHint?: boolean;
  habitCount?: number;
  isCombinedView?: boolean;
}

function TimePill({
  value,
  label,
  isHeroLight,
  colors,
}: {
  value: number;
  label: string;
  isHeroLight: boolean;
  colors: ReturnType<typeof useAppTheme>['colors'];
}) {
  const fill = isHeroLight ? 'rgba(255, 255, 255, 0.12)' : colors.surface;
  const border = isHeroLight ? 'rgba(255, 255, 255, 0.16)' : colors.border;
  const text = isHeroLight ? colors.onAccent : colors.text;
  const muted = isHeroLight ? colors.onAccentMuted : colors.mutedText;

  return (
    <View
      className="flex-1 items-center rounded-2xl border py-2.5"
      style={{ borderColor: border, backgroundColor: fill }}
    >
      <Text className="text-xl font-bold tabular-nums" style={{ color: text }}>
        {String(value).padStart(2, '0')}
      </Text>
      <Text className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: muted }}>
        {label}
      </Text>
    </View>
  );
}

export function StreakHero({
  habit,
  habits = [],
  currency,
  showAllHabitsHint,
  habitCount = 1,
  isCombinedView = false,
}: StreakHeroProps) {
  const { colors, isDark } = useAppTheme();
  const isHeroLight = !isDark;

  const combined = useMemo(() => {
    if (!isCombinedView) return null;
    const active = habits.filter((h) => h.quitDate && getSoberDays(h.quitDate) > 0);
    const totalDays = habits.reduce(
      (sum, h) => sum + (h.quitDate ? getSoberDays(h.quitDate) : 0),
      0
    );
    const totalSaved = habits.reduce(
      (sum, h) => sum + (h.quitDate ? calculateSavings(h.quitDate, h.dailyCost) : 0),
      0
    );
    const longest = active.reduce<{ habit: Habit | null; days: number }>(
      (best, h) => {
        const days = getSoberDays(h.quitDate!);
        return days > best.days ? { habit: h, days } : best;
      },
      { habit: null, days: 0 }
    );
    return { totalDays, totalSaved, activeCount: active.length, longest };
  }, [habits, isCombinedView]);

  const single = habit ?? habits[0];
  if (!single) return null;

  const Icon = isCombinedView ? LayoutGrid : getHabitLucideIcon(single.type);
  const quitDate = single.quitDate ?? '';

  const [streak, setStreak] = useState(() => calculateStreak(quitDate));
  const [savings, setSavings] = useState(() => calculateSavings(quitDate, single.dailyCost));

  useEffect(() => {
    if (isCombinedView) return;
    const tick = () => {
      setStreak(calculateStreak(quitDate));
      setSavings(calculateSavings(quitDate, single.dailyCost));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isCombinedView, quitDate, single.dailyCost]);

  const displayDays = isCombinedView ? combined!.totalDays : streak.days;
  const displaySavings = isCombinedView ? combined!.totalSaved : savings;
  const title = isCombinedView ? 'All' : single.name;
  const subtitle =
    isCombinedView || (showAllHabitsHint && habitCount > 1)
      ? 'Active streak'
      : 'Your streak';
  const streakDetail = isCombinedView
    ? `${combined!.activeCount} active · ${habitCount} habits`
    : `${displayDays === 1 ? 'day' : 'days'} strong`;

  const heroBg = isHeroLight ? lightPalette.deep : `${colors.primaryStrong}12`;
  const heroHeaderBg = isHeroLight ? lightPalette.mid : `${colors.primaryStrong}18`;
  const heroText = isHeroLight ? colors.onAccent : colors.text;
  const heroMuted = isHeroLight ? colors.onAccentMuted : colors.mutedText;
  const iconColor = isHeroLight ? colors.onAccent : colors.primaryStrong;

  return (
    <View
      className="overflow-hidden rounded-3xl"
      style={
        isHeroLight
          ? { backgroundColor: heroBg, ...lightCardShadow }
          : { borderWidth: 1, borderColor: colors.primaryStrong, backgroundColor: heroBg }
      }
    >
      <View className="px-5 pb-2 pt-5" style={{ backgroundColor: heroHeaderBg }}>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View
              className="mr-3 rounded-2xl p-2.5"
              style={
                isHeroLight
                  ? { backgroundColor: 'rgba(255, 255, 255, 0.14)' }
                  : themedIconWrap(colors, isDark, 'primary')
              }
            >
              <Icon size={22} color={iconColor} />
            </View>
            <View>
              <Text
                className="text-[10px] font-bold uppercase tracking-[0.16em]"
                style={{ color: heroMuted }}
              >
                {subtitle}
              </Text>
              <Text className="text-lg font-bold" style={{ color: heroText }}>
                {title}
              </Text>
            </View>
          </View>
          <View
            className="flex-row items-center rounded-full px-2.5 py-1"
            style={
              isHeroLight
                ? { backgroundColor: 'rgba(255, 255, 255, 0.14)' }
                : themedIconWrap(colors, isDark, 'primary')
            }
          >
            <Flame size={14} color={iconColor} />
            <Text className="ml-1 text-xs font-bold" style={{ color: heroText }}>
              {isCombinedView ? 'ALL' : 'LIVE'}
            </Text>
          </View>
        </View>
      </View>

      <View className="items-center px-5 pb-4 pt-3">
        <Text className="text-[76px] font-bold leading-[80px] tabular-nums" style={{ color: heroText }}>
          {displayDays}
        </Text>
        <Text className="text-sm font-medium" style={{ color: heroMuted }}>
          {isCombinedView ? 'combined days' : streakDetail}
        </Text>
        {isCombinedView && combined!.longest.habit ? (
          <Text className="mt-1 text-center text-xs" style={{ color: heroMuted }}>
            Longest · {combined!.longest.habit.name} · {combined!.longest.days}d
          </Text>
        ) : null}
      </View>

      {!isCombinedView ? (
        <View className="flex-row gap-2 px-5 pb-5">
          <TimePill value={streak.hours} label="hrs" isHeroLight={isHeroLight} colors={colors} />
          <TimePill value={streak.minutes} label="min" isHeroLight={isHeroLight} colors={colors} />
          <TimePill value={streak.seconds} label="sec" isHeroLight={isHeroLight} colors={colors} />
        </View>
      ) : (
        <View className="pb-5" />
      )}

      <View
        className="mx-5 mb-5 rounded-2xl border px-4 py-3.5"
        style={
          isHeroLight
            ? {
                borderColor: 'rgba(255, 255, 255, 0.18)',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            : {
                borderColor: `${colors.secondary}44`,
                backgroundColor: `${colors.secondary}12`,
              }
        }
      >
        <View className="flex-row items-end justify-between">
          <View>
            <Text className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: heroMuted }}>
              Money saved
            </Text>
            <Text
              className="mt-1 text-2xl font-bold"
              style={{ color: isHeroLight ? '#7EE4B5' : colors.secondary }}
            >
              {currency} ${displaySavings.toFixed(2)}
            </Text>
          </View>
          <Text className="pb-0.5 text-xs" style={{ color: heroMuted }}>
            {isCombinedView
              ? `${habitCount} habits`
              : `$${single.dailyCost.toFixed(2)}/day`}
          </Text>
        </View>
      </View>
    </View>
  );
}
