import { useMemo } from 'react';
import { View } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { lightPalette } from '../../constants/theme';
import { StreakRunRow, buildStreakRuns } from '../../lib/statisticsCharts';
import { themedBox } from '../../lib/themeStyles';
import { ProgressHistoryItem } from '../../types';
import { ThemedText } from '../ui/ThemedText';

export interface StreakJourneyListProps {
  history: ProgressHistoryItem[];
  currentDays: number;
  runsOverride?: StreakRunRow[];
}

export function StreakJourneyList({
  history,
  currentDays,
  runsOverride,
}: StreakJourneyListProps) {
  const { colors, isDark } = useAppTheme();

  const runs = useMemo(
    () => runsOverride ?? buildStreakRuns(history, currentDays),
    [runsOverride, history, currentDays]
  );

  const maxDays = useMemo(
    () => Math.max(...runs.map((r) => r.days), 1),
    [runs]
  );

  if (runs.length === 0) {
    return (
      <ThemedText variant="muted" className="text-sm leading-5">
        Your streak runs will appear here after you log progress or start again.
      </ThemedText>
    );
  }

  return (
    <View className="gap-3">
      {runs.map((run, index) => {
        const widthPct = Math.max(12, Math.round((run.days / maxDays) * 100));
        const barColor = run.isCurrent ? lightPalette.teal : isDark ? '#5A6B7D' : lightPalette.mid;

        return (
          <View
            key={run.id}
            className="rounded-2xl px-3.5 py-3"
            style={themedBox(colors, isDark, {
              fill: 'surface',
              accent: run.isCurrent ? 'primary' : 'neutral',
              selected: run.isCurrent,
            })}
          >
            <View className="flex-row items-start justify-between gap-3">
              <View className="min-w-0 flex-1">
                <View className="flex-row items-center gap-2">
                  <ThemedText className="text-sm font-semibold">{run.label}</ThemedText>
                  {run.isCurrent ? (
                    <View
                      className="rounded-full px-2 py-0.5"
                      style={{ backgroundColor: `${lightPalette.teal}22` }}
                    >
                      <ThemedText
                        className="text-[10px] font-bold uppercase tracking-wide"
                        style={{ color: lightPalette.teal }}
                      >
                        Live
                      </ThemedText>
                    </View>
                  ) : (
                    <ThemedText variant="muted" className="text-[10px] font-semibold">
                      #{index + 1}
                    </ThemedText>
                  )}
                </View>
                {run.subtitle ? (
                  <ThemedText variant="muted" className="mt-0.5 text-xs">
                    {run.subtitle}
                  </ThemedText>
                ) : null}
              </View>
              <View className="flex-row items-baseline">
                <ThemedText className="text-xl font-bold tabular-nums">{run.days}</ThemedText>
                <ThemedText variant="muted" className="ml-1 text-xs font-medium">
                  days
                </ThemedText>
              </View>
            </View>
            <View
              className="mt-2.5 h-2 overflow-hidden rounded-full"
              style={{ backgroundColor: isDark ? colors.border : '#E8EEF4' }}
            >
              <View
                className="h-full rounded-full"
                style={{ width: `${widthPct}%`, backgroundColor: barColor }}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}
