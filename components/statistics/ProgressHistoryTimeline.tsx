import { format } from 'date-fns';
import { View } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { lightPalette } from '../../constants/theme';
import { getSurfaceStyle } from '../../lib/themeStyles';
import { ProgressHistoryItem } from '../../types';
import { ThemedText } from '../ui/ThemedText';
import { TagChip } from '../ui/TagChip';

export interface ProgressHistoryTimelineProps {
  items: ProgressHistoryItem[];
  currency: string;
}

export function ProgressHistoryTimeline({ items, currency }: ProgressHistoryTimelineProps) {
  const { colors, isDark } = useAppTheme();
  const accent = lightPalette.teal;

  const sorted = [...items].sort((a, b) => b.durationDays - a.durationDays);

  if (sorted.length === 0) {
    return null;
  }

  return (
    <View
      className="overflow-hidden rounded-2xl"
      style={getSurfaceStyle(colors, isDark, { fill: 'surface' })}
    >
      {sorted.map((item, index) => {
        const isLast = index === sorted.length - 1;

        return (
          <View key={item.id} className="flex-row">
            <View className="w-12 items-center py-4">
              <View
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: accent }}
              />
              {!isLast ? (
                <View
                  className="mt-1 min-h-[24px] w-0.5 flex-1"
                  style={{ backgroundColor: isDark ? colors.border : '#DDE6EE' }}
                />
              ) : null}
            </View>
            <View
              className={`min-w-0 flex-1 py-3.5 pr-4 ${isLast ? '' : 'border-b'}`}
              style={
                isLast
                  ? undefined
                  : { borderBottomColor: isDark ? colors.border : '#E8EEF4' }
              }
            >
              <View className="flex-row items-baseline justify-between gap-2">
                <ThemedText className="text-sm font-bold" style={{ color: accent }}>
                  {item.habitName}
                </ThemedText>
                <ThemedText variant="muted" className="text-[11px] tabular-nums">
                  {item.durationDays} day{item.durationDays === 1 ? '' : 's'}
                </ThemedText>
              </View>
              <ThemedText variant="muted" className="mt-0.5 text-xs">
                {format(new Date(item.startedAt), 'd MMM yyyy')} –{' '}
                {format(new Date(item.endedAt), 'd MMM yyyy')}
              </ThemedText>
              <ThemedText variant="body" className="mt-1 text-xs font-medium">
                {currency} ${item.estimatedSavings.toFixed(2)} estimated saved
              </ThemedText>
              {item.reflection ? (
                <ThemedText variant="body" className="mt-2 text-sm leading-5">
                  {item.reflection}
                </ThemedText>
              ) : null}
              {item.triggers && item.triggers.length > 0 ? (
                <View className="mt-2 flex-row flex-wrap gap-1.5">
                  {item.triggers.map((trigger) => (
                    <TagChip key={trigger} label={trigger} />
                  ))}
                </View>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}
