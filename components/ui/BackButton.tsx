import { ChevronLeft, X } from 'lucide-react-native';
import { Pressable } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { ThemedText } from './ThemedText';

export type BackButtonIcon = 'back' | 'close';

export interface BackButtonProps {
  onPress: () => void;
  /** Button label; omit for icon-only. */
  label?: string;
  icon?: BackButtonIcon;
  className?: string;
}

export function BackButton({
  onPress,
  label = 'Back',
  icon = 'back',
  className = 'mb-4 -ml-1 self-start',
}: BackButtonProps) {
  const { colors } = useAppTheme();
  const Icon = icon === 'close' ? X : ChevronLeft;
  const accessibilityLabel =
    label || (icon === 'close' ? 'Close' : 'Go back');

  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className={`flex-row items-center py-2 active:opacity-70 ${className}`}
    >
      <Icon size={26} color={colors.primaryStrong} strokeWidth={2.5} />
      {label ? (
        <ThemedText
          className="ml-1 text-base font-semibold"
          style={{ color: colors.primaryStrong }}
        >
          {label}
        </ThemedText>
      ) : null}
    </Pressable>
  );
}
