import { View } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { themedBox } from '../lib/themeStyles';
import { ThemedText } from './ui/ThemedText';

export interface HealthMilestoneProps {
  title: string;
  description: string;
  timeLabel: string;
  unlocked: boolean;
  embedded?: boolean;
  isLast?: boolean;
}

export function HealthMilestoneCard({
  title,
  description,
  timeLabel,
  unlocked,
  embedded = false,
  isLast = false,
}: HealthMilestoneProps) {
  const { colors, isDark } = useAppTheme();
  const boxStyle = themedBox(colors, isDark, {
    accent: unlocked ? 'success' : 'neutral',
    selected: unlocked,
  });
  const statusWrap = themedBox(colors, isDark, {
    accent: unlocked ? 'success' : 'neutral',
    fill: 'card',
  });

  const header = (
    <View className="mb-2 flex-row items-center justify-between">
      <ThemedText
        variant={unlocked ? 'success' : 'muted'}
        className="text-xs font-semibold uppercase tracking-wide"
      >
        {timeLabel}
      </ThemedText>
      <View className="rounded-full border px-2.5 py-0.5" style={statusWrap}>
        <ThemedText
          variant={unlocked ? 'success' : 'muted'}
          className="text-[10px] font-semibold uppercase"
        >
          {unlocked ? 'Unlocked' : 'Locked'}
        </ThemedText>
      </View>
    </View>
  );

  const body = (
    <>
      <ThemedText variant="title" className="text-base font-semibold">
        {title}
      </ThemedText>
      <ThemedText variant="muted" className="mt-1.5 text-sm leading-5">
        {description}
      </ThemedText>
      {!unlocked ? (
        <ThemedText variant="muted" className="mt-2 text-xs">
          Keep going to unlock this milestone.
        </ThemedText>
      ) : null}
    </>
  );

  if (embedded) {
    return (
      <View
        className="py-4"
        style={
          isLast ? undefined : { borderBottomWidth: 1, borderBottomColor: colors.border }
        }
      >
        {header}
        {body}
      </View>
    );
  }

  return (
    <View className="mb-4 flex-row">
      <View
        className="mr-3 w-1 rounded-full"
        style={{ backgroundColor: unlocked ? colors.secondary : colors.border }}
      />
      <View
        className="flex-1 rounded-3xl px-4 py-4"
        style={{ ...boxStyle, opacity: unlocked ? 1 : 0.9 }}
      >
        {header}
        {body}
      </View>
    </View>
  );
}
