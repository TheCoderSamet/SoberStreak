import { View } from 'react-native';
import { ThemedText } from '../ui/ThemedText';

export interface ChartCenterLabelProps {
  primary: string;
  secondary: string;
  tertiary?: string;
}

export function ChartCenterLabel({ primary, secondary, tertiary }: ChartCenterLabelProps) {
  return (
    <View className="items-center justify-center px-3" pointerEvents="none">
      <ThemedText className="text-[28px] font-bold leading-8">{primary}</ThemedText>
      <ThemedText variant="muted" className="mt-1 max-w-[100px] text-center text-sm font-semibold">
        {secondary}
      </ThemedText>
      {tertiary ? (
        <ThemedText variant="muted" className="mt-1 text-[11px] font-medium uppercase tracking-wide">
          {tertiary}
        </ThemedText>
      ) : null}
    </View>
  );
}
