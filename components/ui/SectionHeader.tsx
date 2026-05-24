import { View } from 'react-native';
import { ThemedText } from './ThemedText';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function SectionHeader({ title, subtitle, className = '' }: SectionHeaderProps) {
  return (
    <View className={`mb-4 ${className}`}>
      <ThemedText className="text-lg font-semibold">{title}</ThemedText>
      {subtitle ? (
        <ThemedText variant="muted" className="mt-1 text-sm">
          {subtitle}
        </ThemedText>
      ) : null}
    </View>
  );
}
