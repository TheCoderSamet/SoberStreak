import { ReactNode } from 'react';
import { View } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { lightCardShadow } from '../../lib/themeStyles';
import { ThemedText } from './ThemedText';

export interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export function Card({ children, className = '', title, subtitle }: CardProps) {
  const { colors, isDark } = useAppTheme();

  return (
    <View
      className={`rounded-3xl p-5 ${className}`}
      style={{
        backgroundColor: colors.card,
        borderWidth: isDark ? 1 : 0,
        borderColor: colors.border,
        ...(isDark ? {} : lightCardShadow),
      }}
    >
      {title ? (
        <ThemedText variant="title" className="text-lg font-semibold">
          {title}
        </ThemedText>
      ) : null}
      {subtitle ? (
        <ThemedText variant="muted" className={`text-sm ${title ? 'mt-1' : ''}`}>
          {subtitle}
        </ThemedText>
      ) : null}
      <View className={title || subtitle ? 'mt-4' : ''}>{children}</View>
    </View>
  );
}
