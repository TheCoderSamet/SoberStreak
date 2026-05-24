import { ReactNode, useMemo, useState } from 'react';
import { View } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import { describeDonutSlice } from '../../lib/chartGeometry';
import { ChartSlice } from '../../lib/statisticsCharts';
import { useAppTheme } from '../../hooks/useAppTheme';
import { ChartLegend, ChartLegendItem } from './ChartLegend';

const SIZE = 232;
const CENTER = SIZE / 2;
const OUTER_R = 98;
const INNER_R = 64;
const SLICE_GAP_RAD = 0.045;

export interface DonutChartProps {
  slices: ChartSlice[];
  legendItems: ChartLegendItem[];
  center: ReactNode;
}

export function DonutChart({ slices, legendItems, center }: DonutChartProps) {
  const { colors, isDark } = useAppTheme();
  const [activeIndex, setActiveIndex] = useState(0);

  const total = useMemo(
    () => slices.reduce((sum, slice) => sum + slice.value, 0),
    [slices]
  );

  const paths = useMemo(() => {
    if (total <= 0) return [];

    let cursor = -Math.PI / 2;
    return slices.map((slice, index) => {
      const sliceAngle = (slice.value / total) * (Math.PI * 2);
      const gap = slices.length > 1 ? SLICE_GAP_RAD : 0;
      const start = cursor + gap / 2;
      const end = cursor + sliceAngle - gap / 2;
      cursor += sliceAngle;

      const expanded =
        index === activeIndex && slices.length > 1 ? OUTER_R + 6 : OUTER_R;

      return {
        key: `${slice.label}-${index}`,
        d: describeDonutSlice(CENTER, CENTER, expanded, INNER_R, start, end),
        color: slice.color,
        index,
      };
    });
  }, [activeIndex, slices, total]);

  if (slices.length === 0 || total <= 0) {
    return null;
  }

  return (
    <View className="items-center">
      <View style={{ width: SIZE, height: SIZE, position: 'relative' }}>
        <Svg width={SIZE} height={SIZE}>
          <G>
            {paths.map((segment) => (
              <Path
                key={segment.key}
                d={segment.d}
                fill={segment.color}
                opacity={segment.index === activeIndex ? 1 : 0.88}
                onPress={() => setActiveIndex(segment.index)}
              />
            ))}
          </G>
        </Svg>
        <View
          className="items-center justify-center rounded-full"
          style={{
            position: 'absolute',
            top: CENTER - INNER_R + 4,
            left: CENTER - INNER_R + 4,
            width: INNER_R * 2 - 8,
            height: INNER_R * 2 - 8,
            backgroundColor: isDark ? colors.card : colors.surface,
            shadowColor: isDark ? '#000' : colors.primaryStrong,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0.35 : 0.08,
            shadowRadius: 8,
            elevation: 3,
          }}
          pointerEvents="none"
        >
          {center}
        </View>
      </View>
      {legendItems.length > 0 ? (
        <ChartLegend
          items={legendItems.map((item, i) => ({
            ...item,
            onPress: () => setActiveIndex(i),
            active: i === activeIndex,
          }))}
        />
      ) : null}
    </View>
  );
}
