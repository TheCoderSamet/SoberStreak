import { Pressable, View } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { themedBox } from '../../lib/themeStyles';
import { ThemedText } from './ThemedText';

export interface ChipSelectorProps {
  chips: string[];
  selected: string[];
  onToggle: (chip: string) => void;
  label?: string;
}

export function ChipSelector({ chips, selected, onToggle, label }: ChipSelectorProps) {
  const { colors, isDark } = useAppTheme();

  return (
    <View>
      {label ? (
        <ThemedText variant="muted" className="mb-2 text-sm font-medium">
          {label}
        </ThemedText>
      ) : null}
      <View className="flex-row flex-wrap gap-2">
        {chips.map((chip) => {
          const isSelected = selected.includes(chip);
          return (
            <Pressable
              key={chip}
              onPress={() => onToggle(chip)}
              className="rounded-2xl px-3.5 py-2"
              style={themedBox(colors, isDark, {
                selected: isSelected,
                accent: isSelected ? 'primary' : 'neutral',
                fill: 'card',
              })}
            >
              <ThemedText
                className="text-sm font-medium"
                style={{ color: isSelected ? colors.primaryStrong : colors.text }}
              >
                {chip}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
