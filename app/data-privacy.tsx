import { Href, useRouter } from 'expo-router';
import { Alert, View } from 'react-native';
import { PageHeader } from '../components/PageHeader';
import { SettingsSection } from '../components/SettingsSection';
import { BackButton } from '../components/ui/BackButton';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { ThemedText } from '../components/ui/ThemedText';
import { useJournalStore } from '../store/useJournalStore';
import { useProgressHistoryStore } from '../store/useProgressHistoryStore';
import { useUserStore } from '../store/useUserStore';

export default function DataPrivacyScreen() {
  const router = useRouter();
  const resetProfile = useUserStore((s) => s.resetProfile);
  const clearJournal = useJournalStore((s) => s.clearEntries);
  const clearHistory = useProgressHistoryStore((s) => s.clearHistory);
  const journalCount = useJournalStore((s) => s.entries.length);
  const historyCount = useProgressHistoryStore((s) => s.history.length);

  const confirmResetProfile = () => {
    Alert.alert(
      'Reset onboarding/profile?',
      'This clears your habit profile and onboarding state. Journal and progress history are not removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset profile',
          style: 'destructive',
          onPress: () => {
            resetProfile();
            router.replace('/(onboarding)/welcome' as Href);
          },
        },
      ]
    );
  };

  const confirmClearJournal = () => {
    if (journalCount === 0) {
      Alert.alert('Nothing to clear', 'There are no journal entries saved yet.');
      return;
    }
    Alert.alert(
      'Clear journal entries?',
      `This will permanently delete ${journalCount} journal entr${journalCount === 1 ? 'y' : 'ies'}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear journal',
          style: 'destructive',
          onPress: () => clearJournal(),
        },
      ]
    );
  };

  const confirmClearHistory = () => {
    if (historyCount === 0) {
      Alert.alert('Nothing to clear', 'There is no progress history saved yet.');
      return;
    }
    Alert.alert(
      'Clear progress history?',
      `This will permanently delete ${historyCount} progress period${historyCount === 1 ? '' : 's'}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear history',
          style: 'destructive',
          onPress: () => clearHistory(),
        },
      ]
    );
  };

  return (
    <ScreenContainer scroll tabBarInset={false}>
      <BackButton onPress={() => router.back()} />

      <PageHeader
        title="Data & Privacy"
        subtitle="Manage your data, privacy, and account settings."
      />

      <SettingsSection title="Privacy">
        <Card>
          <ThemedText variant="body" className="text-sm leading-6">
            Habits, journal entries, and progress history are saved on this device and synced to
            your signed-in account when cloud sync is available. Your community posts appear
            anonymous by default.
          </ThemedText>
        </Card>
      </SettingsSection>

      <SettingsSection title="Setup">
        <Card>
          <ThemedText variant="muted" className="text-sm leading-5">
            Walk through onboarding again to review habit type, reason, and dates. Your saved
            data is not deleted unless you use reset below.
          </ThemedText>
          <View className="mt-4">
            <Button
              title="Review onboarding setup"
              variant="secondary"
              onPress={() => {
                Alert.alert(
                  'Review onboarding?',
                  'You can walk through setup again. Your data is kept unless you reset your profile.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Continue',
                      onPress: () => router.push('/(onboarding)/welcome' as Href),
                    },
                  ]
                );
              }}
            />
          </View>
        </Card>
      </SettingsSection>

      <SettingsSection title="Data actions">
        <Card>
          <ThemedText variant="muted" className="mb-4 text-sm leading-5">
            Destructive actions require confirmation. Signing out does not remove your account.
            Use Account to sign out.
          </ThemedText>
          <View className="gap-3">
            <Button title="Reset onboarding/profile" variant="danger" onPress={confirmResetProfile} />
            <Button title="Clear journal entries" variant="danger" onPress={confirmClearJournal} />
            <Button
              title="Clear progress history"
              variant="danger"
              onPress={confirmClearHistory}
            />
          </View>
        </Card>
      </SettingsSection>
    </ScreenContainer>
  );
}
