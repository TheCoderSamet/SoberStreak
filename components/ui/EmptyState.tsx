import { ReactNode } from 'react';
import { View } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { getSurfaceStyle } from '../../lib/themeStyles';
import { ThemedText } from './ThemedText';

export interface EmptyStateProps {
  title: string;
  message: string;
  action?: ReactNode;
}

export function EmptyState({ title, message, action }: EmptyStateProps) {
  const { colors, isDark } = useAppTheme();

  return (
    <View className="rounded-3xl px-5 py-6" style={getSurfaceStyle(colors, isDark)}>
      <ThemedText className="text-base font-semibold">{title}</ThemedText>
      <ThemedText variant="muted" className="mt-2 text-sm leading-5">
        {message}
      </ThemedText>
      {action ? <View className="mt-4">{action}</View> : null}
    </View>
  );
}
