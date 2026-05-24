import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { Lock } from 'lucide-react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { PageHeader } from './PageHeader';
import { themedIconWrap } from '../lib/themeStyles';
import { BackButton } from './ui/BackButton';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { ScreenContainer } from './ui/ScreenContainer';
import { ThemedText } from './ui/ThemedText';

export interface PremiumBenefitCard {
  title: string;
  description: string;
}

const DEFAULT_FEATURES = [
  'Multiple habit tracking',
  'Mood tracking',
  'Daily notes',
  'Trigger reflection',
  'Statistics and community preview',
];

export interface PremiumLockedProps {
  title: string;
  description: string;
  features?: string[];
  benefitCards?: PremiumBenefitCard[];
  showBack?: boolean;
  /** Use true when rendered inside a tab screen (floating navbar). */
  tabBarInset?: boolean;
}

export function PremiumLocked({
  title,
  description,
  features = DEFAULT_FEATURES,
  benefitCards,
  showBack = false,
  tabBarInset = false,
}: PremiumLockedProps) {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();

  return (
    <ScreenContainer scroll tabBarInset={tabBarInset}>
      {showBack ? (
        <BackButton onPress={() => router.back()} className="mb-3 self-start" />
      ) : null}
      <PageHeader title={title} subtitle={description} />

      <Card className="items-center py-6">
        <View
          className="mb-4 rounded-full p-5"
          style={themedIconWrap(colors, isDark, 'primary')}
        >
          <Lock size={32} color={colors.primary} />
        </View>
        <ThemedText variant="primary" className="text-sm font-semibold uppercase tracking-wide">
          Premium feature
        </ThemedText>
        <ThemedText variant="muted" className="mt-2 text-center text-sm leading-5">
          Subscribe with a membership plan, or ask for Premium access on your account.
        </ThemedText>
      </Card>

      {benefitCards && benefitCards.length > 0 ? (
        <View className="mt-4 gap-3">
          {benefitCards.map((benefit) => (
            <Card key={benefit.title}>
              <ThemedText className="text-base font-semibold">{benefit.title}</ThemedText>
              <ThemedText variant="muted" className="mt-1 text-sm leading-5">
                {benefit.description}
              </ThemedText>
            </Card>
          ))}
        </View>
      ) : (
        <Card className="mt-4" title="What is included" subtitle="Premium membership">
          {features.map((benefit) => (
            <View key={benefit} className="mb-2 flex-row items-start">
              <ThemedText variant="success" className="mr-2">
                ✓
              </ThemedText>
              <ThemedText variant="body" className="flex-1 text-sm leading-5">
                {benefit}
              </ThemedText>
            </View>
          ))}
        </Card>
      )}

      <ThemedText variant="muted" className="mt-4 text-center text-xs leading-5">
        App Store and Google Play billing will be available soon. Admin-granted Premium works
        today after you sign in.
      </ThemedText>

      <View className="mt-6 pb-4">
        <Button title="View membership plans" onPress={() => router.push('/paywall')} />
      </View>
    </ScreenContainer>
  );
}
