import { useMemo } from 'react';
import {
  MoodCounts,
  TRIGGER_CHART_COLORS,
  buildHabitSavingsPieData,
  buildMoodPieData,
  buildTriggerPieData,
  getDominantMood,
} from '../../lib/statisticsCharts';
import { ChartCenterLabel } from './ChartCenterLabel';
import { DonutChart } from './DonutChart';
import { ThemedText } from '../ui/ThemedText';

export function MoodChart({ counts }: { counts: MoodCounts }) {
  const dominant = useMemo(() => getDominantMood(counts), [counts]);
  const slices = useMemo(() => buildMoodPieData(counts), [counts]);

  if (!dominant || slices.length === 0) {
    return (
      <ThemedText variant="muted" className="text-sm leading-5">
        Save journal entries to unlock your mood breakdown chart.
      </ThemedText>
    );
  }

  const legendItems = slices.map((slice) => ({
    color: slice.color,
    label: slice.label,
    value: `${slice.value} · ${Math.round((slice.value / dominant.total) * 100)}%`,
  }));

  return (
    <DonutChart
      slices={slices}
      legendItems={legendItems}
      center={
        <ChartCenterLabel
          primary={`${dominant.percent}%`}
          secondary={dominant.label}
          tertiary={`${dominant.total} entries`}
        />
      }
    />
  );
}

export function TriggersChart({
  triggers,
}: {
  triggers: { label: string; count: number }[];
}) {
  const slices = useMemo(() => buildTriggerPieData(triggers), [triggers]);
  const total = triggers.reduce((sum, t) => sum + t.count, 0);
  const top = triggers[0];

  if (!top || slices.length === 0) {
    return (
      <ThemedText variant="muted" className="text-sm leading-5">
        Add triggers in journal entries or start-again reflections to see patterns here.
      </ThemedText>
    );
  }

  const topPercent = Math.round((top.count / total) * 100);
  const legendItems = triggers.map((item, index) => ({
    color: TRIGGER_CHART_COLORS[index % TRIGGER_CHART_COLORS.length],
    label: item.label,
    value: `${item.count} · ${Math.round((item.count / total) * 100)}%`,
  }));

  return (
    <DonutChart
      slices={slices}
      legendItems={legendItems}
      center={
        <ChartCenterLabel
          primary={`${topPercent}%`}
          secondary={top.label}
          tertiary={`${total} mentions`}
        />
      }
    />
  );
}

export function SavingsByHabitChart({
  habits,
  currency,
}: {
  habits: { name: string; saved: number }[];
  currency: string;
}) {
  const slices = useMemo(() => buildHabitSavingsPieData(habits), [habits]);
  const totalSaved = habits.reduce((sum, h) => sum + h.saved, 0);

  if (slices.length < 2) {
    return null;
  }

  const legendItems = slices.map((slice) => ({
    color: slice.color,
    label: slice.label,
    value: `$${slice.value.toFixed(0)}`,
  }));

  return (
    <DonutChart
      slices={slices}
      legendItems={legendItems}
      center={
        <ChartCenterLabel
          primary={`$${totalSaved.toFixed(0)}`}
          secondary="Total saved"
          tertiary={currency}
        />
      }
    />
  );
}
