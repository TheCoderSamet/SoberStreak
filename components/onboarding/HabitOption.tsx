import { Pressable, View } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { HabitDefinition } from '../../constants/habits';
import { getHabitLucideIcon } from '../../lib/habitIcons';
import { themedBox, themedIconWrap } from '../../lib/themeStyles';
import { ThemedText } from '../ui/ThemedText';

export interface HabitOptionProps {
  definition: HabitDefinition;
  selected: boolean;
  onPress: () => void;
}

export function HabitOption({ definition, selected, onPress }: HabitOptionProps) {
  const { colors, isDark } = useAppTheme();
  const Icon = getHabitLucideIcon(definition.type);
  const costLabel =
    definition.defaultDailyCost > 0
      ? `~$${definition.defaultDailyCost}/day example`
      : '$0/day is okay';

  const boxStyle = themedBox(colors, isDark, { selected, accent: selected ? 'primary' : 'neutral' });
  const iconWrap = themedIconWrap(colors, isDark, 'primary');

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className="mb-3 rounded-3xl px-4 py-4"
      style={boxStyle}
    >
      <View className="flex-row items-start">
        <View className="mr-4 rounded-2xl p-3" style={iconWrap}>
          <Icon size={24} color={selected ? colors.primaryStrong : colors.mutedText} />
        </View>
        <View className="flex-1">
          <ThemedText variant="title" className="text-lg font-semibold">
            {definition.name}
          </ThemedText>
          <ThemedText variant="muted" className="mt-1 text-sm leading-5">
            {definition.cardDescription}
          </ThemedText>
          <ThemedText variant="primary" className="mt-2 text-xs font-medium">
            {costLabel}
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );
}
