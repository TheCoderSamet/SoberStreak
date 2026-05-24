import { View } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { tagChipStyle } from '../../lib/themeStyles';
import { ThemedText } from './ThemedText';

export interface TagChipProps {
  label: string;
}

export function TagChip({ label }: TagChipProps) {
  const { colors, isDark } = useAppTheme();

  return (
    <View className="rounded-full px-2.5 py-1" style={tagChipStyle(colors, isDark)}>
      <ThemedText variant="muted" className="text-xs">
        {label}
      </ThemedText>
    </View>
  );
}
