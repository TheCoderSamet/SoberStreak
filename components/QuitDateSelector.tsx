import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { useLayoutEffect, useMemo, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { quitDateFromPickerDate } from '../lib/dateMath';
import { getSurfaceStyle, themedBox } from '../lib/themeStyles';
import { ThemedText } from './ui/ThemedText';

export interface QuitDateSelectorProps {
  quitDateIso: string | null;
  onQuitDateChange: (iso: string) => void;
}

export function QuitDateSelector({ quitDateIso, onQuitDateChange }: QuitDateSelectorProps) {
  const { colors, isDark } = useAppTheme();
  const [pickerDate, setPickerDate] = useState(() => dateFromIsoOrToday(quitDateIso));
  const [showAndroidPicker, setShowAndroidPicker] = useState(Platform.OS === 'android');

  useLayoutEffect(() => {
    if (!quitDateIso) {
      onQuitDateChange(quitDateFromPickerDate(pickerDate));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedPreview = useMemo(() => {
    if (!quitDateIso) return null;
    return format(new Date(quitDateIso), 'EEEE, d MMMM yyyy');
  }, [quitDateIso]);

  const handlePickerChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowAndroidPicker(false);
      if (event.type === 'dismissed') return;
    }
    if (!date) return;
    setPickerDate(date);
    onQuitDateChange(quitDateFromPickerDate(date));
  };

  return (
    <View>
      {selectedPreview ? (
        <View
          className="mb-4 rounded-2xl px-4 py-3"
          style={themedBox(colors, isDark, { accent: 'success', selected: true })}
        >
          <ThemedText variant="muted" className="text-xs font-medium uppercase tracking-wide">
            Selected start date
          </ThemedText>
          <ThemedText variant="success" className="mt-1 text-base font-semibold">
            {selectedPreview}
          </ThemedText>
        </View>
      ) : null}

      <ThemedText variant="muted" className="mb-3 text-sm leading-5">
        Choose the day your progress started. You can pick any date on or before today.
      </ThemedText>

      <View className="overflow-hidden rounded-2xl" style={getSurfaceStyle(colors, isDark)}>
        {Platform.OS === 'ios' ? (
          <DateTimePicker
            value={pickerDate}
            mode="date"
            display="spinner"
            maximumDate={new Date()}
            onChange={handlePickerChange}
            themeVariant={isDark ? 'dark' : 'light'}
          />
        ) : showAndroidPicker ? (
          <DateTimePicker
            value={pickerDate}
            mode="date"
            display="default"
            maximumDate={new Date()}
            onChange={handlePickerChange}
          />
        ) : (
          <Pressable onPress={() => setShowAndroidPicker(true)} className="px-4 py-5">
            <ThemedText variant="primary" className="text-center text-base font-semibold">
              Tap to choose date
            </ThemedText>
            {selectedPreview ? (
              <ThemedText variant="muted" className="mt-2 text-center text-sm">
                {selectedPreview}
              </ThemedText>
            ) : null}
          </Pressable>
        )}
      </View>
    </View>
  );
}

function dateFromIsoOrToday(iso: string | null): Date {
  if (iso) {
    const parsed = new Date(iso);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
