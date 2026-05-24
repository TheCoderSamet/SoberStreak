import { ChevronRight, LucideIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { themedIconWrap } from '../lib/themeStyles';
import { ThemedText } from './ui/ThemedText';

export interface SettingRowProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  rightText?: string;
  onPress?: () => void;
  danger?: boolean;
  showChevron?: boolean;
  isLast?: boolean;
}

export function SettingRow({
  title,
  subtitle,
  icon: Icon,
  rightText,
  onPress,
  danger = false,
  showChevron = Boolean(onPress),
  isLast = false,
}: SettingRowProps) {
  const { colors, isDark } = useAppTheme();
  const titleColor = danger ? colors.danger : colors.text;
  const iconColor = danger ? colors.danger : colors.primary;

  const content = (
    <View
      className="flex-row items-center py-3.5"
      style={
        isLast
          ? undefined
          : { borderBottomWidth: 1, borderBottomColor: colors.border }
      }
    >
      {Icon ? (
        <View className="mr-3 rounded-xl p-2.5" style={themedIconWrap(colors, isDark, danger ? 'danger' : 'primary')}>
          <Icon size={18} color={iconColor} />
        </View>
      ) : null}
      <View className="min-w-0 flex-1">
        <ThemedText className="text-base font-medium" style={{ color: titleColor }}>
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText variant="muted" className="mt-0.5 text-sm leading-5">
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {rightText ? (
        <ThemedText variant="muted" className="mr-2 max-w-[40%] text-right text-sm">
          {rightText}
        </ThemedText>
      ) : null}
      {showChevron && onPress ? (
        <ChevronRight size={20} color={colors.mutedText} />
      ) : null}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      {content}
    </Pressable>
  );
}
