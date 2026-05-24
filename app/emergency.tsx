import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { Wind } from 'lucide-react-native';
import { PageHeader } from '../components/PageHeader';
import { SettingsSection } from '../components/SettingsSection';
import { useAppTheme } from '../hooks/useAppTheme';
import { themedIconWrap } from '../lib/themeStyles';
import { SupportResourceCard } from '../components/SupportResourceCard';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { ThemedText } from '../components/ui/ThemedText';
import { AU_SUPPORT_RESOURCES } from '../constants/supportResources';

const BREATHING_STEPS = [
  'Breathe in for 4 seconds',
  'Hold for 4 seconds',
  'Breathe out for 4 seconds',
  'Repeat 3 times',
];

export default function EmergencyScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();

  return (
    <ScreenContainer scroll tabBarInset={false} contentClassName="pb-8">
      <PageHeader
        title="Emergency Help"
        subtitle="Pause. Breathe. This moment will pass."
      />

      <Card title="Breathing exercise" subtitle="4-4-4 box breathing">
        <View className="mb-3 flex-row items-center">
          <View className="mr-3 rounded-full p-2" style={themedIconWrap(colors, isDark, 'primary')}>
            <Wind size={20} color={colors.primaryStrong} />
          </View>
          <ThemedText variant="muted" className="flex-1 text-sm">
            Follow these steps slowly. You do not need to be perfect.
          </ThemedText>
        </View>
        {BREATHING_STEPS.map((step, index) => (
          <View key={step} className="mb-3 flex-row items-start last:mb-0">
            <View
              className="mr-3 h-7 w-7 items-center justify-center rounded-full"
              style={themedIconWrap(colors, isDark, 'primary')}
            >
              <Text className="text-sm font-bold" style={{ color: colors.primaryStrong }}>
                {index + 1}
              </Text>
            </View>
            <ThemedText variant="body" className="flex-1 pt-0.5 text-base">
              {step}
            </ThemedText>
          </View>
        ))}
      </Card>

      <View
        className="mt-4 rounded-3xl p-6"
        style={{
          backgroundColor: `${colors.danger}14`,
          borderWidth: 1,
          borderColor: `${colors.danger}40`,
        }}
      >
        <ThemedText className="text-center text-2xl font-bold leading-9" style={{ color: colors.danger }}>
          If you are in immediate danger, call emergency services now.
        </ThemedText>
        <ThemedText
          className="mt-4 text-center text-4xl font-bold tracking-wide"
          style={{ color: colors.danger }}
        >
          000
        </ThemedText>
        <ThemedText variant="muted" className="mt-3 text-center text-base leading-6">
          In Australia. If you are elsewhere, use your local emergency number.
        </ThemedText>
      </View>

      <SettingsSection title="Support resources" className="mt-4">
        {AU_SUPPORT_RESOURCES.map((resource) => (
          <SupportResourceCard key={resource.name} resource={resource} />
        ))}
      </SettingsSection>

      <View className="mt-6">
        <Button title="Back to Home" variant="primary" onPress={() => router.replace('/(tabs)')} />
      </View>
    </ScreenContainer>
  );
}
