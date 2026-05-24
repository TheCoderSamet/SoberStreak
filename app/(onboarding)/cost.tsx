import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { TextInput, View } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { getMoneyInputStyle, themedBox } from '../../lib/themeStyles';
import { OnboardingShell } from '../../components/onboarding/OnboardingShell';
import { Button } from '../../components/ui/Button';
import { ThemedText } from '../../components/ui/ThemedText';
import { FormError } from '../../components/FormError';
import { getCostExampleLabel } from '../../constants/habits';
import { parseMoneyAmount, validateDailyCost } from '../../lib/validation';
import { useUserStore } from '../../store/useUserStore';

export default function CostScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const habit = useUserStore((s) => s.profile.primaryHabit);
  const currency = useUserStore((s) => s.profile.currency);
  const updatePrimaryHabit = useUserStore((s) => s.updatePrimaryHabit);
  const [costText, setCostText] = useState(
    habit?.dailyCost !== undefined ? String(habit.dailyCost) : ''
  );
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!habit) router.replace('/(onboarding)/habit');
  }, [habit, router]);

  const parsed = parseMoneyAmount(costText);
  const validationError = validateDailyCost(costText);
  const canContinue = validationError === null;
  const displayError = touched ? validationError ?? error : error;

  const savingsPreview = useMemo(() => {
    if (parsed === null) return null;
    return Math.round(parsed * 30 * 100) / 100;
  }, [parsed]);

  const exampleLabel = habit ? getCostExampleLabel(habit.type) : '';

  const handleContinue = () => {
    setTouched(true);
    const err = validateDailyCost(costText);
    if (err) {
      setError(err);
      return;
    }
    if (parsed === null) return;
    updatePrimaryHabit({ dailyCost: parsed });
    router.push('/(onboarding)/date');
  };

  return (
    <OnboardingShell
      keyboardAware
      step={4}
      title="Daily cost"
      subtitle="This helps calculate how much money you save over time."
      footer={
        <Button title="Continue" onPress={handleContinue} disabled={!canContinue} />
      }
    >
      {exampleLabel ? (
        <View
          className="mb-4 rounded-2xl px-4 py-3"
          style={themedBox(colors, isDark, { accent: 'primary' })}
        >
          <ThemedText variant="body" className="text-sm">
            Typical example for your habit:{' '}
            <ThemedText variant="primary" className="font-semibold">
              {exampleLabel}
            </ThemedText>
          </ThemedText>
        </View>
      ) : null}

      <ThemedText variant="muted" className="mb-2 text-sm font-medium">
        Daily cost in {currency}
      </ThemedText>
      <View
        className="flex-row items-center rounded-2xl"
        style={getMoneyInputStyle(colors, isDark, Boolean(displayError))}
      >
        <ThemedText variant="muted" className="pl-4 text-lg">
          $
        </ThemedText>
        <TextInput
          className="flex-1 px-3 py-4 text-2xl font-semibold"
          style={{ color: colors.text }}
          placeholder="0.00"
          placeholderTextColor={colors.mutedText}
          value={costText}
          onChangeText={(text) => {
            setCostText(text);
            setError(null);
          }}
          onBlur={() => setTouched(true)}
          keyboardType="decimal-pad"
          returnKeyType="done"
        />
      </View>
      <FormError message={displayError} />

      {savingsPreview !== null ? (
        <View
          className="mt-4 rounded-2xl px-4 py-3"
          style={themedBox(colors, isDark, { accent: 'success', selected: true })}
        >
          <ThemedText variant="body" className="text-center text-sm">
            In 30 days, you could save about{' '}
            <ThemedText variant="success" className="font-bold">
              ${savingsPreview.toFixed(2)} {currency}
            </ThemedText>
            .
          </ThemedText>
        </View>
      ) : (
        <ThemedText variant="muted" className="mt-3 text-sm">
          Enter 0 if money saved does not apply.
        </ThemedText>
      )}
    </OnboardingShell>
  );
}
