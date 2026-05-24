import { Pressable, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { getSurfaceStyle } from '../lib/themeStyles';
import type { SubscriptionPlan } from '../lib/subscriptionPlans';
import { ThemedText } from './ui/ThemedText';

export interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan;
  selected: boolean;
  onSelect: () => void;
}

export function SubscriptionPlanCard({ plan, selected, onSelect }: SubscriptionPlanCardProps) {
  const { colors, isDark } = useAppTheme();

  return (
    <Pressable
      onPress={onSelect}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      className="mb-3 rounded-2xl px-4 py-4"
      style={{
        ...getSurfaceStyle(colors, isDark, { fill: 'surface' }),
        borderWidth: selected ? 2 : isDark ? 1 : 0,
        borderColor: selected ? colors.primaryStrong : colors.border,
        backgroundColor: selected ? `${colors.primary}14` : colors.surface,
      }}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <View className="flex-row flex-wrap items-center gap-2">
            <ThemedText className="text-base font-semibold">{plan.title}</ThemedText>
            {plan.badge ? (
              <View
                className="rounded-full px-2 py-0.5"
                style={{ backgroundColor: `${colors.secondary}18` }}
              >
                <ThemedText
                  className="text-[10px] font-bold uppercase tracking-wide"
                  style={{ color: colors.secondary }}
                >
                  {plan.badge}
                </ThemedText>
              </View>
            ) : null}
          </View>
          <ThemedText variant="muted" className="mt-1 text-xs">
            {plan.billingNote}
          </ThemedText>
        </View>

        <View className="items-end">
          <ThemedText className="text-xl font-bold">{plan.periodLabel}</ThemedText>
          {plan.subtitle ? (
            <ThemedText variant="muted" className="mt-0.5 text-xs">
              {plan.subtitle}
            </ThemedText>
          ) : null}
        </View>
      </View>

      {selected ? (
        <View className="mt-3 flex-row items-center">
          <Check size={16} color={colors.primaryStrong} />
          <ThemedText variant="primary" className="ml-1.5 text-xs font-medium">
            Selected
          </ThemedText>
        </View>
      ) : null}
    </Pressable>
  );
}
