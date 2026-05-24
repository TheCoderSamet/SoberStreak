import type { LucideIcon } from 'lucide-react-native';
import { ReactNode } from 'react';
import { View } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { lightCardShadow } from '../../lib/themeStyles';
import { ThemedText } from '../ui/ThemedText';

export interface StatisticsSectionCardProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  accentColor: string;
  children: ReactNode;
  className?: string;
}

export function StatisticsSectionCard({
  title,
  subtitle,
  accentColor,
  icon: Icon,
  children,
  className = '',
}: StatisticsSectionCardProps) {
  const { colors, isDark } = useAppTheme();

  return (
    <View
      className={`mb-4 overflow-hidden rounded-3xl ${className}`}
      style={{
        backgroundColor: colors.card,
        borderWidth: isDark ? 1 : 0,
        borderColor: colors.border,
        ...(isDark ? {} : lightCardShadow),
      }}
    >
      <View className="h-1.5 w-full" style={{ backgroundColor: accentColor }} />
      <View
        className="px-5 pb-2 pt-4"
        style={{ backgroundColor: isDark ? `${accentColor}12` : `${accentColor}10` }}
      >
        <View className="flex-row items-start">
          <View
            className="mr-3 h-10 w-10 items-center justify-center rounded-2xl"
            style={{ backgroundColor: isDark ? `${accentColor}28` : `${accentColor}22` }}
          >
            <Icon size={20} color={accentColor} strokeWidth={2.25} />
          </View>
          <View className="min-w-0 flex-1">
            <ThemedText className="text-lg font-bold">{title}</ThemedText>
            {subtitle ? (
              <ThemedText variant="muted" className="mt-1 text-sm leading-5">
                {subtitle}
              </ThemedText>
            ) : null}
          </View>
        </View>
      </View>
      <View className="px-5 pb-5 pt-3">{children}</View>
    </View>
  );
}
