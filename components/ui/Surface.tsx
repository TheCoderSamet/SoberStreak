import { ReactNode } from 'react';
import { View, ViewStyle } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { getSurfaceStyle } from '../../lib/themeStyles';

export interface SurfaceProps {
  children: ReactNode;
  className?: string;
  style?: ViewStyle;
  fill?: 'card' | 'surface';
}

export function Surface({ children, className = '', style, fill = 'card' }: SurfaceProps) {
  const { colors, isDark } = useAppTheme();

  return (
    <View className={`rounded-3xl ${className}`} style={[getSurfaceStyle(colors, isDark, { fill }), style]}>
      {children}
    </View>
  );
}
