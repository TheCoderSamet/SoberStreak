import { Pressable, View } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { getSurfaceStyle } from '../../lib/themeStyles';
import { ThemedText } from '../ui/ThemedText';

export interface ChartLegendItem {
  color: string;
  label: string;
  value?: string;
  active?: boolean;
  onPress?: () => void;
}

export interface ChartLegendProps {
  items: ChartLegendItem[];
}

export function ChartLegend({ items }: ChartLegendProps) {
  const { colors, isDark } = useAppTheme();

  return (
    <View className="mt-2 w-full gap-2">
      {items.map((item) => {
        const row = (
          <View
            className="flex-row items-center rounded-2xl px-3 py-2.5"
            style={{
              ...getSurfaceStyle(colors, isDark, { fill: 'surface' }),
              borderWidth: item.active ? 1.5 : 0,
              borderColor: item.active ? item.color : 'transparent',
            }}
          >
            <View
              className="mr-3 h-4 w-4 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <View className="min-w-0 flex-1 flex-row items-center justify-between gap-2">
              <ThemedText
                className={`text-sm ${item.active ? 'font-bold' : 'font-semibold'}`}
                numberOfLines={1}
              >
                {item.label}
              </ThemedText>
              {item.value ? (
                <ThemedText variant="muted" className="text-xs font-medium">
                  {item.value}
                </ThemedText>
              ) : null}
            </View>
          </View>
        );

        if (item.onPress) {
          return (
            <Pressable key={item.label} onPress={item.onPress} className="active:opacity-85">
              {row}
            </Pressable>
          );
        }

        return <View key={item.label}>{row}</View>;
      })}
    </View>
  );
}
