import { ReactNode } from 'react';
import { View } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { getSurfaceStyle, themedBox } from '../lib/themeStyles';
import { ThemedText } from './ui/ThemedText';

export type InfoCardAccent = 'primary' | 'success' | 'danger' | 'neutral';

export interface InfoCardProps {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  accent?: InfoCardAccent;
  className?: string;
}

export function InfoCard({
  title,
  subtitle,
  children,
  accent = 'neutral',
  className = '',
}: InfoCardProps) {
  const { colors, isDark } = useAppTheme();
  const boxStyle =
    accent === 'neutral'
      ? getSurfaceStyle(colors, isDark)
      : { ...getSurfaceStyle(colors, isDark), ...themedBox(colors, isDark, { accent, selected: true }) };

  return (
    <View className={`rounded-3xl p-5 ${className}`} style={boxStyle}>
      {title ? (
        <ThemedText variant="title" className="text-lg font-semibold">
          {title}
        </ThemedText>
      ) : null}
      {subtitle ? (
        <ThemedText variant="muted" className={`text-sm leading-5 ${title ? 'mt-1' : ''}`}>
          {subtitle}
        </ThemedText>
      ) : null}
      {children ? <View className={title || subtitle ? 'mt-4' : ''}>{children}</View> : null}
    </View>
  );
}
