import { ReactNode } from 'react';
import { View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { themedIconWrap } from '../../lib/themeStyles';
import { Switch, SwitchProps } from './Switch';
import { ThemedText } from './ThemedText';

export interface SwitchRowProps extends Omit<SwitchProps, 'checked'> {
  label: string;
  description?: string;
  icon?: LucideIcon;
  value: boolean;
  onValueChange: (value: boolean) => void;
  /** Extra content below description (inside label column). */
  children?: ReactNode;
  isLast?: boolean;
}

export function SwitchRow({
  label,
  description,
  icon: Icon,
  value,
  onValueChange,
  disabled,
  children,
  isLast = false,
  ...switchProps
}: SwitchRowProps) {
  const { colors, isDark } = useAppTheme();

  return (
    <View
      className="flex-row items-center py-3.5"
      style={
        isLast
          ? undefined
          : { borderBottomWidth: 1, borderBottomColor: colors.border }
      }
    >
      {Icon ? (
        <View className="mr-3 rounded-xl p-2.5" style={themedIconWrap(colors, isDark, 'primary')}>
          <Icon size={20} color={colors.primaryStrong} />
        </View>
      ) : null}

      <View className="min-w-0 flex-1 pr-3">
        <ThemedText className="text-base font-medium">{label}</ThemedText>
        {description ? (
          <ThemedText variant="muted" className="mt-0.5 text-sm leading-5">
            {description}
          </ThemedText>
        ) : null}
        {children}
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        accessibilityLabel={label}
        {...switchProps}
      />
    </View>
  );
}
