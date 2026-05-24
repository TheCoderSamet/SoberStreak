import { View } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { ThemedText } from './ThemedText';

export interface ProgressBarProps {
  progress: number;
  label?: string;
}

export function ProgressBar({ progress, label }: ProgressBarProps) {
  const { colors } = useAppTheme();
  const clamped = Math.min(1, Math.max(0, progress));

  return (
    <View>
      {label ? (
        <ThemedText variant="muted" className="mb-2 text-xs">
          {label}
        </ThemedText>
      ) : null}
      <View
        className="h-2.5 overflow-hidden rounded-full"
        style={{ backgroundColor: `${colors.primary}22` }}
      >
        <View
          className="h-full rounded-full"
          style={{
            width: `${clamped * 100}%`,
            backgroundColor: colors.primary,
          }}
        />
      </View>
    </View>
  );
}
