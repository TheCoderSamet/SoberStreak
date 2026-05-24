import { Href, Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { Lock, Mail, User } from 'lucide-react-native';
import {
  AuthBanner,
  AuthFooterPrompt,
  AuthFormCard,
  AuthShell,
} from '../../components/auth/AuthShell';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { hasFinishedOnboarding } from '../../lib/onboardingState';
import { validateEmail, validateName } from '../../lib/validation';
import { useAuthStore } from '../../store/useAuthStore';
import { useUserStore } from '../../store/useUserStore';

function validatePassword(password: string): string | null {
  if (password.length < 6) return 'Password must be at least 6 characters.';
  return null;
}

export default function SignupScreen() {
  const router = useRouter();
  const initialized = useAuthStore((s) => s.initialized);
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const signUpWithEmail = useAuthStore((s) => s.signUpWithEmail);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  if (initialized && user) {
    return <Redirect href="/" />;
  }

  const handleCreate = async () => {
    const nextNameError = validateName(name);
    const nextEmailError = validateEmail(email);
    const nextPasswordError = validatePassword(password);
    let nextConfirmError: string | null = null;
    if (confirmPassword !== password) {
      nextConfirmError = 'Passwords do not match.';
    }

    setNameError(nextNameError);
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    setConfirmError(nextConfirmError);
    setFormError(null);

    if (nextNameError || nextEmailError || nextPasswordError || nextConfirmError) return;

    const result = await signUpWithEmail(name, email, password);
    if (result.error) {
      setFormError(result.error);
      return;
    }

    if (result.needsEmailConfirmation && !result.hasSession) {
      Alert.alert(
        'Check your email',
        'We sent a confirmation link if your project requires it. Sign in after you confirm.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login' as Href) }]
      );
      return;
    }

    const profile = useUserStore.getState().profile;
    if (hasFinishedOnboarding(profile)) {
      router.replace('/(tabs)');
      return;
    }

    router.replace('/(onboarding)/welcome');
  };

  return (
    <AuthShell
      showBack
      onBack={() => router.back()}
      title="Create account"
      subtitle="A few details to secure your progress and unlock Premium when you subscribe."
      footer={
        <AuthFooterPrompt
          prompt="Already have an account?"
          actionLabel="Sign in"
          onPress={() => router.replace('/(auth)/login' as Href)}
          disabled={loading}
        />
      }
    >
      <AuthFormCard>
        {formError ? <AuthBanner message={formError} /> : null}

        <TextField
          label="Display name"
          leftIcon={User}
          value={name}
          onChangeText={(text) => {
            setName(text);
            setNameError(null);
            setFormError(null);
          }}
          placeholder="How should we greet you?"
          error={nameError}
          autoCapitalize="words"
          returnKeyType="next"
        />
        <TextField
          label="Email"
          leftIcon={Mail}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setEmailError(null);
            setFormError(null);
          }}
          placeholder="you@example.com"
          error={emailError}
          keyboardType="email-address"
          autoCapitalize="none"
          returnKeyType="next"
        />
        <TextField
          label="Password"
          leftIcon={Lock}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setPasswordError(null);
            setFormError(null);
          }}
          placeholder="At least 6 characters"
          error={passwordError}
          secureTextEntry
          returnKeyType="next"
        />
        <TextField
          label="Confirm password"
          leftIcon={Lock}
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            setConfirmError(null);
            setFormError(null);
          }}
          placeholder="Repeat your password"
          error={confirmError}
          secureTextEntry
          returnKeyType="done"
          onSubmitEditing={handleCreate}
        />

        <Button title="Create account" onPress={handleCreate} loading={loading} />
      </AuthFormCard>
    </AuthShell>
  );
}
