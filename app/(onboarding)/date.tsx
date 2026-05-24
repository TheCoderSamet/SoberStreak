import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { QuitDateSelector } from '../../components/QuitDateSelector';
import { OnboardingShell } from '../../components/onboarding/OnboardingShell';
import { Button } from '../../components/ui/Button';
import { FormError } from '../../components/FormError';
import { ThemedText } from '../../components/ui/ThemedText';
import { quitDateFromPickerDate } from '../../lib/dateMath';
import { validateQuitDate } from '../../lib/validation';
import { useUserStore } from '../../store/useUserStore';

export default function DateScreen() {
  const router = useRouter();
  const habit = useUserStore((s) => s.profile.primaryHabit);
  const updatePrimaryHabit = useUserStore((s) => s.updatePrimaryHabit);
  const [quitDateIso, setQuitDateIso] = useState<string | null>(
    () => habit?.quitDate || quitDateFromPickerDate(new Date())
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!habit) router.replace('/(onboarding)/habit');
  }, [habit, router]);

  const handleContinue = () => {
    const err = validateQuitDate(quitDateIso);
    if (err) {
      setError(err);
      return;
    }
    if (!quitDateIso) return;
    updatePrimaryHabit({ quitDate: quitDateIso });
    router.push('/(onboarding)/notifications');
  };

  return (
    <OnboardingShell
      step={5}
      title="When did you start?"
      subtitle="Choose when your progress started."
      footer={<Button title="Continue" onPress={handleContinue} />}
    >
      <ThemedText variant="muted" className="mb-4 text-sm leading-5">
        Your streak will start from the date you choose below.
      </ThemedText>
      <QuitDateSelector
        quitDateIso={quitDateIso}
        onQuitDateChange={(iso) => {
          setQuitDateIso(iso);
          setError(null);
        }}
      />
      <FormError message={error} />
    </OnboardingShell>
  );
}
