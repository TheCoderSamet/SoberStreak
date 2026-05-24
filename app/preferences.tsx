import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { useColorScheme } from 'react-native';
import { Bell, Moon } from 'lucide-react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { PageHeader } from '../components/PageHeader';
import { SettingsSection } from '../components/SettingsSection';
import { BackButton } from '../components/ui/BackButton';
import { Card } from '../components/ui/Card';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { SwitchRow } from '../components/ui/SwitchRow';
import { ThemedText } from '../components/ui/ThemedText';
import {
  cancelAllNotifications,
  requestNotificationPermission,
  scheduleDailyMotivationReminder,
} from '../lib/notifications';
import { useThemeStore } from '../store/useThemeStore';
import { useUserStore } from '../store/useUserStore';

export default function PreferencesScreen() {
  const router = useRouter();
  const { isDark } = useAppTheme();
  const systemScheme = useColorScheme();
  const themeMode = useThemeStore((s) => s.mode);
  const setThemeMode = useThemeStore((s) => s.setThemeMode);
  const profile = useUserStore((s) => s.profile);
  const updateNotifications = useUserStore((s) => s.updateNotifications);
  const [notificationLoading, setNotificationLoading] = useState(false);

  const useSystemTheme = themeMode === 'system';
  const darkModeEnabled =
    themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');

  const handleSystemThemeChange = (enabled: boolean) => {
    if (enabled) {
      setThemeMode('system');
      return;
    }
    setThemeMode(isDark ? 'dark' : 'light');
  };

  const handleDarkModeChange = (enabled: boolean) => {
    setThemeMode(enabled ? 'dark' : 'light');
  };

  const handleReminderChange = async (enabled: boolean) => {
    if (notificationLoading) return;

    if (enabled) {
      setNotificationLoading(true);
      try {
        const granted = await requestNotificationPermission();
        if (granted) {
          await scheduleDailyMotivationReminder(9, 0);
          updateNotifications(true, '09:00');
          return;
        }
        updateNotifications(false);
        Alert.alert(
          'Permission not granted',
          'Daily reminders need notification permission. You can enable it in your device settings and try again.'
        );
      } catch (error) {
        console.error('Enable daily reminder failed:', error);
        Alert.alert(
          'Could not enable reminders',
          'Something went wrong while setting up your daily reminder. Please try again.'
        );
      } finally {
        setNotificationLoading(false);
      }
      return;
    }

    setNotificationLoading(true);
    try {
      await cancelAllNotifications();
      updateNotifications(false);
    } catch (error) {
      console.error('Disable reminders failed:', error);
      Alert.alert(
        'Could not disable reminders',
        'Something went wrong while turning off reminders. Please try again.'
      );
    } finally {
      setNotificationLoading(false);
    }
  };

  return (
    <ScreenContainer scroll tabBarInset={false}>
      <BackButton onPress={() => router.back()} />

      <PageHeader title="App Preferences" subtitle="Personalize your experience." />

      <SettingsSection title="Appearance">
        <Card className="p-0 px-4">
          <SwitchRow
            label="Use system appearance"
            description="Match your device light or dark setting"
            value={useSystemTheme}
            onValueChange={handleSystemThemeChange}
          />
          <SwitchRow
            label="Dark mode"
            description={
              useSystemTheme
                ? 'Turn off system appearance to control this manually'
                : 'Night theme with warm accents'
            }
            icon={Moon}
            value={darkModeEnabled}
            onValueChange={handleDarkModeChange}
            disabled={useSystemTheme}
            isLast
          />
        </Card>
      </SettingsSection>

      <SettingsSection title="Notifications">
        <Card className="p-0 px-4">
          <SwitchRow
            label="Daily reminder"
            description={
              profile.notificationsEnabled
                ? `Gentle nudge at ${profile.preferredReminderTime}`
                : 'A gentle daily nudge on your phone'
            }
            icon={Bell}
            value={profile.notificationsEnabled}
            onValueChange={handleReminderChange}
            disabled={notificationLoading}
            isLast
          />
        </Card>
      </SettingsSection>

    </ScreenContainer>
  );
}
