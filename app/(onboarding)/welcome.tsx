import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { themedIconWrap } from '../../lib/themeStyles';
import { OnboardingShell } from '../../components/onboarding/OnboardingShell';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ThemedText } from '../../components/ui/ThemedText';

const BENEFITS = [
  'Track your progress',
  'See your money saved',
  'Get support when cravings hit',
];

export default function WelcomeScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();

  return (
    <OnboardingShell
      step={1}
      footer={<Button title="Start" onPress={() => router.push('/(onboarding)/habit')} />}
    >
      <View className="items-center pb-2 pt-4">
        <View
          className="mb-6 h-24 w-24 items-center justify-center rounded-full"
          style={themedIconWrap(colors, isDark, 'primary')}
        >
          <Sparkles size={40} color={colors.primaryStrong} />
        </View>
        <ThemedText variant="title" className="text-center text-4xl font-bold">
          Sober Streak
        </ThemedText>
        <ThemedText variant="primary" className="mt-2 text-center text-lg">
          One day at a time.
        </ThemedText>
      </View>

      <Card>
        {BENEFITS.map((benefit) => (
          <View key={benefit} className="mb-3 flex-row items-center last:mb-0">
            <ThemedText variant="success" className="mr-2">
              ✓
            </ThemedText>
            <ThemedText variant="body" className="flex-1 text-base">
              {benefit}
            </ThemedText>
          </View>
        ))}
      </Card>

      <ThemedText variant="muted" className="mt-6 text-center text-xs leading-5">
        Private by default. Your progress is tied to your account.
      </ThemedText>
    </OnboardingShell>
  );
}
