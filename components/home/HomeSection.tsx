import { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { ThemedText } from '../ui/ThemedText';

export interface HomeSectionProps {
  title: string;
  children: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export function HomeSection({ title, children, actionLabel, onAction }: HomeSectionProps) {
  const { colors } = useAppTheme();

  return (
    <View className="mt-6">
      <View className="mb-3 flex-row items-center justify-between">
        <ThemedText className="text-[17px] font-semibold">{title}</ThemedText>
        {actionLabel && onAction ? (
          <Pressable onPress={onAction} className="flex-row items-center active:opacity-70">
            <ThemedText variant="primary" className="text-sm font-medium">
              {actionLabel}
            </ThemedText>
            <ChevronRight size={16} color={colors.primary} />
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}
