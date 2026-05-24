import { ActivityIndicator, Pressable, Text, View, ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { getSurfaceStyle } from '../../lib/themeStyles';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  icon?: LucideIcon;
  loading?: boolean;
}

const ON_PRIMARY_TEXT = '#FFFFFF';

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  icon: Icon,
  loading = false,
}: ButtonProps) {
  const { colors, isDark } = useAppTheme();
  const isDisabled = disabled || loading;

  let containerStyle: ViewStyle = {};
  let textColor = ON_PRIMARY_TEXT;
  let spinnerColor = ON_PRIMARY_TEXT;

  switch (variant) {
    case 'primary':
      containerStyle = { backgroundColor: colors.primaryStrong };
      textColor = ON_PRIMARY_TEXT;
      spinnerColor = ON_PRIMARY_TEXT;
      break;
    case 'secondary':
      containerStyle = getSurfaceStyle(colors, isDark, { fill: 'surface' });
      textColor = colors.text;
      spinnerColor = colors.primaryStrong;
      break;
    case 'ghost':
      containerStyle = { backgroundColor: 'transparent' };
      textColor = colors.primaryStrong;
      spinnerColor = colors.primaryStrong;
      break;
    case 'danger':
      containerStyle = { backgroundColor: colors.danger };
      textColor = ON_PRIMARY_TEXT;
      spinnerColor = ON_PRIMARY_TEXT;
      break;
  }

  if (isDisabled) {
    containerStyle = {
      backgroundColor: isDark ? colors.surface : `${colors.primary}12`,
      borderWidth: isDark && variant !== 'ghost' ? 1 : 0,
      borderColor: colors.border,
    };
    textColor = colors.mutedText;
    spinnerColor = colors.mutedText;
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className="min-h-[52px] flex-row items-center justify-center rounded-2xl px-5 py-3.5"
      style={[containerStyle, isDisabled ? { opacity: 0.55 } : undefined]}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} />
      ) : (
        <View className="flex-row items-center gap-2">
          {Icon ? <Icon size={20} color={spinnerColor} /> : null}
          <Text className="text-base font-semibold" style={{ color: textColor }}>
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
