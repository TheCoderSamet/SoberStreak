import { ReactNode } from 'react';
import { View, ViewProps } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';

export type ThemedViewVariant = 'background' | 'surface' | 'card';

export interface ThemedViewProps extends ViewProps {
  children: ReactNode;
  variant?: ThemedViewVariant;
  className?: string;
}

export function ThemedView({
  children,
  variant = 'background',
  className = '',
  style,
  ...rest
}: ThemedViewProps) {
  const { colors } = useAppTheme();

  const backgroundMap: Record<ThemedViewVariant, string> = {
    background: colors.background,
    surface: colors.surface,
    card: colors.card,
  };

  return (
    <View className={className} style={[{ backgroundColor: backgroundMap[variant] }, style]} {...rest}>
      {children}
    </View>
  );
}
