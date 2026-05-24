import { Text, View } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { getSurfaceStyle, themedBox, themedIconWrap } from '../lib/themeStyles';
import { ThemedText } from './ui/ThemedText';

export interface MilestoneBadgeProps {
  title: string;
  description: string;
  requiredDays: number;
  unlocked: boolean;
}

export function MilestoneBadge({
  title,
  description,
  requiredDays,
  unlocked,
}: MilestoneBadgeProps) {
  const { colors, isDark } = useAppTheme();
  const surfaceStyle = unlocked
    ? { ...getSurfaceStyle(colors, isDark), ...themedBox(colors, isDark, { accent: 'success', selected: true }) }
    : getSurfaceStyle(colors, isDark);
  const iconWrap = themedIconWrap(colors, isDark, unlocked ? 'success' : 'neutral');

  return (
    <View
      className="mb-3 flex-row items-start rounded-3xl px-4 py-4"
      style={{ ...surfaceStyle, opacity: unlocked ? 1 : 0.92 }}
    >
      <View className="mr-4 h-14 w-14 items-center justify-center rounded-2xl" style={iconWrap}>
        <Text
          className="text-lg font-bold"
          style={{ color: unlocked ? colors.secondary : colors.mutedText }}
        >
          {requiredDays}
        </Text>
        <Text
          className="text-[9px] uppercase"
          style={{ color: unlocked ? colors.secondary : colors.mutedText }}
        >
          days
        </Text>
      </View>
      <View className="flex-1">
        <ThemedText variant="title" className="text-lg font-semibold">
          {title}
        </ThemedText>
        <ThemedText variant="muted" className="mt-1 text-sm leading-5">
          {description}
        </ThemedText>
        <ThemedText
          variant={unlocked ? 'success' : 'muted'}
          className="mt-2 text-xs font-medium"
        >
          {unlocked ? 'Unlocked' : `${requiredDays} days required`}
        </ThemedText>
      </View>
    </View>
  );
}
