import { format } from 'date-fns';
import { View } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import {
  MOOD_CHART_COLORS,
  MOOD_LABELS,
  MoodKey,
} from '../../lib/statisticsCharts';
import { getSurfaceStyle } from '../../lib/themeStyles';
import { JournalEntry } from '../../types';
import { ThemedText } from '../ui/ThemedText';

function moodKey(entry: JournalEntry): MoodKey {
  return entry.mood;
}

function notePreview(note: string, maxLength = 100): string {
  const trimmed = note.trim();
  if (!trimmed) return 'No note added';
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength)}…`;
}

export interface JournalEntriesTimelineProps {
  entries: JournalEntry[];
  showHabitName?: boolean;
  habitNames?: Record<string, string>;
}

export function JournalEntriesTimeline({
  entries,
  showHabitName = false,
  habitNames,
}: JournalEntriesTimelineProps) {
  const { colors, isDark } = useAppTheme();

  const sorted = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (sorted.length === 0) {
    return null;
  }

  return (
    <View
      className="overflow-hidden rounded-2xl"
      style={getSurfaceStyle(colors, isDark, { fill: 'surface' })}
    >
      {sorted.map((entry, index) => {
        const key = moodKey(entry);
        const accent = MOOD_CHART_COLORS[key];
        const isLast = index === sorted.length - 1;

        return (
          <View key={entry.id} className="flex-row">
            <View className="w-12 items-center py-4">
              <View
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: accent }}
              />
              {!isLast ? (
                <View
                  className="mt-1 w-0.5 flex-1 min-h-[24px]"
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
                <View className="min-w-0 flex-1">
                  <ThemedText className="text-sm font-bold" style={{ color: accent }}>
                    {MOOD_LABELS[key]}
                  </ThemedText>
                  {showHabitName && habitNames?.[entry.habitId] ? (
                    <ThemedText variant="muted" className="mt-0.5 text-[11px] font-medium">
                      {habitNames[entry.habitId]}
                    </ThemedText>
                  ) : null}
                </View>
                <ThemedText variant="muted" className="shrink-0 text-[11px]">
                  {format(new Date(entry.date), 'd MMM · h:mm a')}
                </ThemedText>
              </View>
              <ThemedText variant="body" className="mt-1.5 text-sm leading-5">
                {notePreview(entry.note)}
              </ThemedText>
            </View>
          </View>
        );
      })}
    </View>
  );
}
