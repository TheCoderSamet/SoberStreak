import { View } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { getSurfaceStyle } from '../../lib/themeStyles';
import { ThemedText } from './ThemedText';

export interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  className?: string;
}

export function StatCard({ label, value, hint, className = '' }: StatCardProps) {
  const { colors, isDark } = useAppTheme();

  return (
    <View className={`rounded-2xl p-4 ${className}`} style={getSurfaceStyle(colors, isDark, { fill: 'surface' })}>
      <ThemedText variant="muted" className="text-sm">
        {label}
      </ThemedText>
      <ThemedText className="mt-1 text-2xl font-bold">{value}</ThemedText>
      {hint ? (
        <ThemedText variant="muted" className="mt-1 text-xs">
          {hint}
        </ThemedText>
      ) : null}
    </View>
  );
}
