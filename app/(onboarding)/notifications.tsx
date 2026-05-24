import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { themedIconWrap } from '../../lib/themeStyles';
import { OnboardingShell } from '../../components/onboarding/OnboardingShell';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ThemedText } from '../../components/ui/ThemedText';
import {
  cancelAllNotifications,
  requestNotificationPermission,
  scheduleDailyMotivationReminder,
} from '../../lib/notifications';
import { scheduleProfileSync } from '../../lib/profileSyncScheduler';
import { useUserStore } from '../../store/useUserStore';

const REMINDER_BENEFITS = [
  'Daily motivation',
  'Gentle progress reminder',
  'No shame, no pressure',
];

const PERMISSION_DENIED_MESSAGE =
  'No problem. You can enable reminders later in Settings.';

const SETUP_FAILED_MESSAGE =
  'We could not set up reminders right now. You can try again in Settings.';

export default function NotificationsScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const habit = useUserStore((s) => s.profile.primaryHabit);
  const completeOnboarding = useUserStore((s) => s.completeOnboarding);
  const updateNotifications = useUserStore((s) => s.updateNotifications);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!habit?.quitDate?.trim()) router.replace('/(onboarding)/date');
  }, [habit, router]);

  const goToTabs = () => {
    completeOnboarding();
    scheduleProfileSync();
    router.replace('/(tabs)');
  };

  const handleEnableReminders = async () => {
    setLoading(true);
    try {
      const granted = await requestNotificationPermission();
      if (granted) {
        await scheduleDailyMotivationReminder(9, 0);
        updateNotifications(true, '09:00');
        goToTabs();
        return;
      }

      updateNotifications(false);
      goToTabs();
      Alert.alert('Reminders not enabled', PERMISSION_DENIED_MESSAGE);
    } catch (error) {
      console.error('Enable reminders failed:', error);
      updateNotifications(false);
      goToTabs();
      Alert.alert('Could not enable reminders', SETUP_FAILED_MESSAGE);
    } finally {
      setLoading(false);
    }
  };

  const handleMaybeLater = async () => {
    setLoading(true);
    try {
      await cancelAllNotifications();
    } catch (error) {
      console.error('Cancel notifications failed:', error);
    } finally {
      updateNotifications(false);
      setLoading(false);
      goToTabs();
    }
  };

  return (
    <OnboardingShell
      step={6}
      title="Daily Reminders"
      subtitle="A small reminder can help you stay connected to your progress."
      footer={
        <View className="gap-3">
          <Button
            title="Enable Reminders"
            variant="primary"
            loading={loading}
            onPress={handleEnableReminders}
          />
          <Button
            title="Maybe Later"
            variant="secondary"
            disabled={loading}
            onPress={handleMaybeLater}
          />
        </View>
      }
    >
      <Card>
        <View className="mb-4 flex-row items-center">
          <View className="mr-3 rounded-full p-2" style={themedIconWrap(colors, isDark, 'primary')}>
            <Bell size={22} color={colors.primaryStrong} />
          </View>
          <ThemedText variant="body" className="flex-1 text-base leading-6">
            A gentle daily nudge at 9:00 AM — optional, and easy to change in Settings.
          </ThemedText>
        </View>
        {REMINDER_BENEFITS.map((benefit) => (
          <View key={benefit} className="mb-2 flex-row items-center">
            <ThemedText variant="success" className="mr-2">
              ✓
            </ThemedText>
            <ThemedText variant="body" className="text-sm">
              {benefit}
            </ThemedText>
          </View>
        ))}
      </Card>
    </OnboardingShell>
  );
}
