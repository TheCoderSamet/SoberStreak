import type { LucideIcon } from 'lucide-react-native';
import { Lock } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { lightCardShadow, themedIconWrap } from '../../lib/themeStyles';
import { ThemedText } from '../ui/ThemedText';

export interface QuickActionItem {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  onPress: () => void;
  accent?: 'primary' | 'danger' | 'success';
  premiumLocked?: boolean;
}

export interface QuickActionGridProps {
  actions: QuickActionItem[];
}

export function QuickActionGrid({ actions }: QuickActionGridProps) {
  const { colors, isDark } = useAppTheme();

  return (
    <View className="flex-row flex-wrap gap-3">
      {actions.map((action) => {
        const Icon = action.icon;
        const accent = action.accent ?? 'primary';
        const iconColor =
          accent === 'danger'
            ? colors.danger
            : accent === 'success'
              ? colors.secondary
              : colors.primary;

        return (
          <Pressable
            key={action.title}
            onPress={action.onPress}
            className="min-h-[110px] flex-1 rounded-2xl p-4 active:opacity-90"
            style={{
              minWidth: '47%',
              maxWidth: '48%',
              backgroundColor: colors.surface,
              borderWidth: isDark ? 1 : 0,
              borderColor: action.premiumLocked ? `${colors.primary}55` : colors.border,
              ...(isDark ? {} : lightCardShadow),
              opacity: action.premiumLocked ? 0.94 : 1,
            }}
          >
            {action.premiumLocked ? (
              <View
                className="absolute right-2.5 top-2.5 flex-row items-center rounded-full px-1.5 py-0.5"
                style={{ backgroundColor: `${colors.primary}16` }}
              >
                <Lock size={10} color={colors.primaryStrong} />
                <ThemedText variant="primary" className="ml-0.5 text-[9px] font-bold uppercase">
                  Pro
                </ThemedText>
              </View>
            ) : null}
            <View className="self-start rounded-xl p-2.5" style={themedIconWrap(colors, isDark, accent)}>
              <Icon size={20} color={iconColor} />
            </View>
            <ThemedText className="mt-3 text-sm font-semibold">{action.title}</ThemedText>
            <ThemedText variant="muted" className="mt-0.5 text-xs leading-4">
              {action.subtitle}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}
