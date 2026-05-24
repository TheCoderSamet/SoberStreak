import { ReactNode } from 'react';
import { View } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { ThemedText } from './ui/ThemedText';

export interface SettingsSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function SettingsSection({ title, children, className = '' }: SettingsSectionProps) {
  const { colors } = useAppTheme();

  return (
    <View className={`mb-5 ${className}`}>
      <ThemedText
        className="mb-2.5 text-[13px] font-semibold uppercase tracking-wider"
        style={{ color: colors.primary }}
      >
        {title}
      </ThemedText>
      {children}
    </View>
  );
}
