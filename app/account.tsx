import { Href, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, TextInput, View } from 'react-native';
import { FormError } from '../components/FormError';
import { KeyRound, Shield } from 'lucide-react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { getDisplayNameFromUser } from '../lib/authUser';
import { PageHeader } from '../components/PageHeader';
import { SettingsSection } from '../components/SettingsSection';
import { BackButton } from '../components/ui/BackButton';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { ThemedText } from '../components/ui/ThemedText';
import { lightCardShadow, themedIconWrap } from '../lib/themeStyles';
import { validateName } from '../lib/validation';
import { useAuthStore } from '../store/useAuthStore';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export default function AccountScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const updateDisplayName = useAuthStore((s) => s.updateDisplayName);
  const signOut = useAuthStore((s) => s.signOut);
  const resetPassword = useAuthStore((s) => s.resetPassword);

  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [resetSending, setResetSending] = useState(false);

  if (!user) {
    return (
      <ScreenContainer tabBarInset={false}>
        <View className="flex-1 items-center justify-center py-16">
          <ThemedText variant="title" className="text-2xl font-bold">
            Not signed in
          </ThemedText>
          <ThemedText variant="muted" className="mt-3 text-center">
            Sign in to view account details.
          </ThemedText>
          <View className="mt-6 w-full px-5">
            <Button title="Sign In" onPress={() => router.replace('/(auth)/login' as Href)} />
          </View>
        </View>
      </ScreenContainer>
    );
  }

  const displayName = getDisplayNameFromUser(user);
  const email = user.email ?? '';

  const handleSignOut = async () => {
    await signOut();
  };

  const handleResetPassword = () => {
    if (!email) {
      Alert.alert('No email', 'Your account does not have an email address for password reset.');
      return;
    }

    Alert.alert(
      'Reset password?',
      `We will send a secure link to ${email}. Open the link in your email to choose a new password.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send link',
          onPress: async () => {
            setResetSending(true);
            const result = await resetPassword(email);
            setResetSending(false);
            if (result.error) {
              Alert.alert('Could not send email', result.error);
              return;
            }
            Alert.alert(
              'Check your email',
              'If an account exists for this address, you will receive a password reset link shortly.'
            );
          },
        },
      ]
    );
  };

  const startEditName = () => {
    setEditName(displayName);
    setNameError(null);
    setIsEditingName(true);
  };

  const cancelEditName = () => {
    setIsEditingName(false);
    setEditName('');
    setNameError(null);
  };

  const saveEditName = async () => {
    const err = validateName(editName);
    if (err) {
      setNameError(err);
      return;
    }
    const result = await updateDisplayName(editName.trim());
    if (result.error) {
      setNameError(result.error);
      return;
    }
    setIsEditingName(false);
    setNameError(null);
    Alert.alert('Name updated');
  };

  return (
    <ScreenContainer scroll keyboardAware tabBarInset={false}>
      <BackButton onPress={() => router.back()} />

      <PageHeader title="Account" subtitle="Your Sober Streak account." />

      <Card>
        <View className="flex-row items-center">
          <View
            className="mr-4 h-16 w-16 items-center justify-center rounded-full"
            style={themedIconWrap(colors, isDark, 'primary')}
          >
            <ThemedText variant="primary" className="text-xl font-bold">
              {getInitials(displayName)}
            </ThemedText>
          </View>
          <View className="flex-1">
            <ThemedText className="text-xl font-bold">{displayName}</ThemedText>
            <ThemedText variant="muted" className="mt-1 text-sm">
              Signed in
            </ThemedText>
          </View>
        </View>
      </Card>

      <SettingsSection title="Details">
        <Card>
          {isEditingName ? (
            <View
              className="pb-3"
              style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
            >
              <ThemedText variant="muted" className="mb-1.5 text-xs">
                Name
              </ThemedText>
              <TextInput
                className="rounded-xl px-3 py-2 text-base"
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  borderWidth: nameError || isDark ? 1 : 0,
                  borderColor: nameError ? colors.danger : colors.border,
                  color: colors.text,
                  ...(nameError || isDark ? {} : lightCardShadow),
                }}
                placeholder="Your name"
                placeholderTextColor={colors.mutedText}
                value={editName}
                onChangeText={(text) => {
                  setEditName(text);
                  setNameError(null);
                }}
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={saveEditName}
              />
              <FormError message={nameError} />
              <View className="mt-2 flex-row items-center gap-4">
                <Pressable onPress={saveEditName} disabled={loading} hitSlop={8}>
                  <ThemedText variant="primary" className="text-sm font-semibold">
                    {loading ? 'Saving…' : 'Save'}
                  </ThemedText>
                </Pressable>
                <Pressable onPress={cancelEditName} disabled={loading} hitSlop={8}>
                  <ThemedText variant="muted" className="text-sm">
                    Cancel
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          ) : (
            <View
              className="flex-row items-center justify-between py-3"
              style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
            >
              <View className="min-w-0 flex-1 pr-3">
                <ThemedText variant="muted" className="text-xs">
                  Name
                </ThemedText>
                <ThemedText className="mt-0.5 text-base font-medium" numberOfLines={1}>
                  {displayName}
                </ThemedText>
              </View>
              <Pressable onPress={startEditName} hitSlop={8}>
                <ThemedText variant="primary" className="text-sm font-medium">
                  Edit
                </ThemedText>
              </Pressable>
            </View>
          )}

          <View className="py-3">
            <ThemedText variant="muted" className="text-xs">
              Email
            </ThemedText>
            <ThemedText className="mt-0.5 text-base" numberOfLines={1}>
              {email || '—'}
            </ThemedText>
          </View>
        </Card>
      </SettingsSection>

      <SettingsSection title="Security">
        <Card>
          <View className="mb-3 flex-row items-center">
            <View className="mr-3 rounded-xl p-2" style={themedIconWrap(colors, isDark, 'primary')}>
              <KeyRound size={20} color={colors.primary} />
            </View>
            <ThemedText className="flex-1 text-base font-semibold">Password</ThemedText>
          </View>
          <ThemedText variant="muted" className="mb-4 text-sm leading-5">
            Send a reset link to your email to choose a new password.
          </ThemedText>
          <Button
            title={resetSending ? 'Sending…' : 'Reset password'}
            variant="secondary"
            onPress={handleResetPassword}
            disabled={resetSending || !email}
          />
        </Card>
      </SettingsSection>

      <Card>
        <View className="flex-row items-start">
          <Shield size={18} color={colors.mutedText} />
          <ThemedText variant="muted" className="ml-2 flex-1 text-sm leading-5">
            Habits are saved to your account. Signing out does not delete your account or habits.
          </ThemedText>
        </View>
      </Card>

      <View className="mt-4 gap-3 pb-4">
        <Button title="Sign out" variant="secondary" onPress={handleSignOut} loading={loading} />
      </View>
    </ScreenContainer>
  );
}
