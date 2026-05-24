import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { themedBox } from '../../lib/themeStyles';
import { OnboardingShell } from '../../components/onboarding/OnboardingShell';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { ThemedText } from '../../components/ui/ThemedText';
import {
  DEFAULT_ONBOARDING_REASON,
  validateReason,
} from '../../lib/validation';
import { useUserStore } from '../../store/useUserStore';

const REASON_CHIPS = [
  'Better health',
  'Save money',
  'More energy',
  'Family',
  'Mental clarity',
];

export default function ReasonScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const savedReason = useUserStore((s) => s.profile.primaryHabit?.reason ?? '');
  const updatePrimaryHabit = useUserStore((s) => s.updatePrimaryHabit);
  const habit = useUserStore((s) => s.profile.primaryHabit);
  const [reason, setReason] = useState(savedReason);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!habit) router.replace('/(onboarding)/habit');
  }, [habit, router]);

  const handleChipPress = (chip: string) => {
    setError(null);
    setReason((prev) => {
      const current = prev.trim();
      if (!current) return chip;
      if (current.includes(chip)) return prev;
      return `${current}, ${chip}`;
    });
  };

  const handleContinue = () => {
    const trimmed = reason.trim();
    if (trimmed.length > 0) {
      const reasonError = validateReason(trimmed);
      if (reasonError) {
        setError(reasonError);
        return;
      }
      updatePrimaryHabit({ reason: trimmed });
    } else {
      updatePrimaryHabit({ reason: DEFAULT_ONBOARDING_REASON });
    }
    router.push('/(onboarding)/cost');
  };

  return (
    <OnboardingShell
      keyboardAware
      step={3}
      title="What is your reason?"
      subtitle="This reason will remind you why you started."
      footer={<Button title="Continue" onPress={handleContinue} />}
    >
      <ThemedText variant="muted" className="mb-3 text-sm">
        Tap a suggestion or write your own. You can skip and use a default reason.
      </ThemedText>
      <View className="mb-4 flex-row flex-wrap gap-2">
        {REASON_CHIPS.map((chip) => (
          <Pressable
            key={chip}
            onPress={() => handleChipPress(chip)}
            className="rounded-2xl px-3.5 py-2"
            style={themedBox(colors, isDark, { accent: 'primary' })}
          >
            <ThemedText variant="primary" className="text-sm font-medium">
              {chip}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <TextField
        label="Your reason"
        value={reason}
        onChangeText={(text) => {
          setReason(text);
          setError(null);
        }}
        placeholder="e.g. For my health and my family"
        error={error}
        multiline
      />
    </OnboardingShell>
  );
}
