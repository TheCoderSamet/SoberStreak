import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { PenLine } from 'lucide-react-native';
import { HabitOption } from '../../components/onboarding/HabitOption';
import { OnboardingShell } from '../../components/onboarding/OnboardingShell';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { FormError } from '../../components/FormError';
import { ThemedText } from '../../components/ui/ThemedText';
import { HABIT_DEFINITIONS } from '../../constants/habits';
import { useAppTheme } from '../../hooks/useAppTheme';
import { createHabitFromInput } from '../../lib/habits';
import { themedBox, themedIconWrap } from '../../lib/themeStyles';
import { validateHabitName } from '../../lib/validation';
import { HabitType } from '../../types';
import { useUserStore } from '../../store/useUserStore';

export default function HabitScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const setOnboardingHabitType = useUserStore((s) => s.setOnboardingHabitType);
  const setPrimaryHabit = useUserStore((s) => s.setPrimaryHabit);

  const [selected, setSelected] = useState<HabitType | null>(null);
  const [customName, setCustomName] = useState('');
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [customNameError, setCustomNameError] = useState<string | null>(null);

  const customSelected = selected === 'custom';
  const handleSelect = (type: HabitType) => {
    setSelected(type);
    setSelectionError(null);
  };

  const handleContinue = () => {
    if (!selected) {
      setSelectionError('Please choose a habit to continue.');
      return;
    }
    if (selected !== 'custom') {
      setOnboardingHabitType(selected);
    }
    if (selected === 'custom') {
      const nameErr = validateHabitName(customName);
      if (nameErr) {
        setCustomNameError(nameErr);
        return;
      }
      setPrimaryHabit(
        createHabitFromInput({
          type: 'custom',
          customName: customName.trim(),
          reason: '',
          dailyCost: 0,
          quitDate: '',
        })
      );
    }

    router.push('/(onboarding)/reason');
  };

  return (
    <OnboardingShell
      step={2}
      title="What are you focusing on?"
      subtitle="Choose the habit you want to focus on first."
      footer={<Button title="Continue" onPress={handleContinue} />}
    >
      <ThemedText variant="muted" className="mb-4 text-sm leading-5">
        Tap one option. You can add details on the next steps.
      </ThemedText>

      {HABIT_DEFINITIONS.map((definition) => (
        <HabitOption
          key={definition.type}
          definition={definition}
          selected={selected === definition.type}
          onPress={() => handleSelect(definition.type)}
        />
      ))}

      <Pressable
        onPress={() => handleSelect('custom')}
        accessibilityRole="button"
        accessibilityState={{ selected: customSelected }}
        className="mb-3 rounded-3xl px-4 py-4"
        style={themedBox(colors, isDark, {
          selected: customSelected,
          accent: customSelected ? 'primary' : 'neutral',
        })}
      >
        <View className="flex-row items-start">
          <View className="mr-4 rounded-2xl p-3" style={themedIconWrap(colors, isDark, 'primary')}>
            <PenLine size={24} color={customSelected ? colors.primaryStrong : colors.mutedText} />
          </View>
          <View className="flex-1">
            <ThemedText className="text-lg font-semibold">Something else</ThemedText>
            <ThemedText variant="muted" className="mt-1 text-sm leading-5">
              Name your own habit
            </ThemedText>
          </View>
        </View>
      </Pressable>

      {customSelected ? (
        <TextField
          label="Habit name"
          value={customName}
          onChangeText={(text) => {
            setCustomName(text);
            setCustomNameError(null);
          }}
          placeholder="e.g. Gaming, Shopping"
          error={customNameError}
        />
      ) : null}

      <FormError message={selectionError} />
    </OnboardingShell>
  );
}
