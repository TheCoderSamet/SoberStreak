import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';
import { BarChart3, BookOpen, Check, Sparkles, Users, X } from 'lucide-react-native';
import { PageHeader } from '../components/PageHeader';
import { SubscriptionPlanCard } from '../components/SubscriptionPlanCard';
import { useAppTheme } from '../hooks/useAppTheme';
import { themedIconWrap } from '../lib/themeStyles';
import {
  DEFAULT_PLAN_ID,
  getSubscriptionPlan,
  SUBSCRIPTION_PLANS,
  type SubscriptionPlanId,
} from '../lib/subscriptionPlans';
import { BackButton } from '../components/ui/BackButton';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { InfoCard } from '../components/InfoCard';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { ThemedText } from '../components/ui/ThemedText';
import { useSubscriptionStore } from '../store/useSubscriptionStore';

const BENEFITS = [
  { icon: Sparkles, title: 'Multiple habit tracking', description: 'Each habit has its own streak and savings.' },
  { icon: BookOpen, title: 'Journal', description: 'Mood tracking, daily notes, and trigger reflection.' },
  { icon: BarChart3, title: 'Statistics', description: 'Streak, savings, moods, and progress history.' },
  { icon: Users, title: 'Community', description: 'Anonymous support preview — posting comes later.' },
];

const FREE_ITEMS = ['1 habit', 'Home counter', 'Health timeline', 'Emergency support'];
const PREMIUM_ITEMS = ['Multiple habits', 'Journal', 'Statistics', 'Community'];

function CompareRow({ included, label }: { included: boolean; label: string }) {
  const { colors } = useAppTheme();
  return (
    <View className="mb-2 flex-row items-center">
      {included ? (
        <Check size={16} color={colors.secondary} />
      ) : (
        <X size={16} color={colors.mutedText} />
      )}
      <ThemedText variant="body" className="ml-2 text-sm">
        {label}
      </ThemedText>
    </View>
  );
}

export default function PaywallScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const serverPremium = useSubscriptionStore((s) => s.serverPremium);
  const premiumSource = useSubscriptionStore((s) => s.source);
  const isServerPremium = serverPremium || premiumSource === 'server';
  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionPlanId>(DEFAULT_PLAN_ID);

  const selectedPlan = getSubscriptionPlan(selectedPlanId);

  const handleSubscribe = () => {
    Alert.alert(
      'Subscriptions coming soon',
      `You selected ${selectedPlan.title} (${selectedPlan.periodLabel}). App Store and Google Play billing will be connected in a future update. No charge has been made.`,
      [{ text: 'OK' }]
    );
  };

  const handleRestore = () => {
    Alert.alert(
      'Restore purchases',
      'When billing is live, you can restore an existing subscription here. Nothing to restore yet.',
      [{ text: 'OK' }]
    );
  };

  return (
    <ScreenContainer scroll tabBarInset={false} contentClassName="pb-8">
      <BackButton onPress={() => router.back()} label="Close" icon="close" className="mb-3 self-start" />

      <View className="mb-4 items-center">
        <View className="rounded-full p-4" style={themedIconWrap(colors, isDark, 'primary')}>
          <Sparkles size={32} color={colors.primaryStrong} />
        </View>
      </View>

      <PageHeader
        title="Membership"
        subtitle="Unlock Premium tools — choose a plan that fits you."
      />

      {isServerPremium ? (
        <InfoCard className="mb-4" accent="success" title="Premium active" subtitle="Your account">
          <ThemedText variant="muted" className="text-xs leading-5">
            Premium is active on your account. You already have full access — no upgrade needed.
          </ThemedText>
        </InfoCard>
      ) : null}

      {!isServerPremium ? (
        <Card title="Choose your plan" subtitle="Prices in USD — cancel anytime when billing is live">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <SubscriptionPlanCard
              key={plan.id}
              plan={plan}
              selected={selectedPlanId === plan.id}
              onSelect={() => setSelectedPlanId(plan.id)}
            />
          ))}
        </Card>
      ) : null}

      <View className="mt-4 gap-3">
        {!isServerPremium ? (
          <Button
            title={`Continue with ${selectedPlan.title} — ${selectedPlan.periodLabel}`}
            onPress={handleSubscribe}
          />
        ) : null}
        {!isServerPremium ? (
          <Button title="Restore purchases" variant="secondary" onPress={handleRestore} />
        ) : null}
        <Button title="Maybe later" variant="ghost" onPress={() => router.back()} />
        <ThemedText variant="muted" className="text-center text-[11px] leading-4">
          Payment will be charged to your App Store or Google Play account when subscriptions are
          available. Subscriptions renew automatically unless canceled at least 24 hours before
          the end of the current period.
        </ThemedText>
      </View>

      <View className="mt-6 gap-3">
        {BENEFITS.map((benefit) => {
          const Icon = benefit.icon;
          return (
            <Card key={benefit.title}>
              <View className="flex-row items-start">
                <View
                  className="mr-3 rounded-2xl p-2.5"
                  style={themedIconWrap(colors, isDark, 'primary')}
                >
                  <Icon size={22} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <ThemedText className="text-base font-semibold">{benefit.title}</ThemedText>
                  <ThemedText variant="muted" className="mt-1 text-sm leading-5">
                    {benefit.description}
                  </ThemedText>
                </View>
              </View>
            </Card>
          );
        })}
      </View>

      <Card className="mt-4" title="Free vs Premium">
        <View className="flex-row gap-4">
          <View className="flex-1">
            <ThemedText variant="muted" className="mb-2 text-xs font-semibold uppercase">
              Free
            </ThemedText>
            {FREE_ITEMS.map((item) => (
              <CompareRow key={item} included label={item} />
            ))}
          </View>
          <View className="flex-1">
            <ThemedText variant="primary" className="mb-2 text-xs font-semibold uppercase">
              Premium
            </ThemedText>
            {PREMIUM_ITEMS.map((item) => (
              <CompareRow key={item} included label={item} />
            ))}
          </View>
        </View>
      </Card>

    </ScreenContainer>
  );
}
