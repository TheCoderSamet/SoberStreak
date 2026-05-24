import { ReactNode } from 'react';
import { View } from 'react-native';
import { ThemedText } from './ui/ThemedText';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  rightElement?: ReactNode;
}

export function PageHeader({ title, subtitle, rightElement }: PageHeaderProps) {
  return (
    <View className="mb-6 flex-row items-start justify-between">
      <View className="min-w-0 flex-1 pr-3">
        <ThemedText variant="title" className="text-3xl font-bold">
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText variant="muted" className="mt-2 text-base leading-6">
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {rightElement ? <View className="shrink-0">{rightElement}</View> : null}
    </View>
  );
}
