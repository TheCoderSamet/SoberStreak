import { usePreventRemove } from '@react-navigation/native';
import { Href, Redirect, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { BackHandler } from 'react-native';
import { Lock, Mail } from 'lucide-react-native';
import {
  AuthBanner,
  AuthFooterPrompt,
  AuthFormCard,
  AuthInlineLink,
  AuthShell,
} from '../../components/auth/AuthShell';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { validateEmail } from '../../lib/validation';
import { useAuthStore } from '../../store/useAuthStore';

function validatePassword(password: string): string | null {
  if (password.trim().length === 0) return 'Password is required.';
  return null;
}

export default function LoginScreen() {
  const router = useRouter();
  const initialized = useAuthStore((s) => s.initialized);
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const signInWithEmail = useAuthStore((s) => s.signInWithEmail);
  const clearError = useAuthStore((s) => s.clearError);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const blockBackNavigation = initialized && !user;

  usePreventRemove(blockBackNavigation, useCallback(() => {}, []));

  useFocusEffect(
    useCallback(() => {
      if (!blockBackNavigation) return;
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => subscription.remove();
    }, [blockBackNavigation])
  );

  if (initialized && user) {
    return <Redirect href="/" />;
  }

  const handleSignIn = async () => {
    clearError();
    const nextEmailError = validateEmail(email);
    const nextPasswordError = validatePassword(password);
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    setFormError(null);

    if (nextEmailError || nextPasswordError) return;

    const result = await signInWithEmail(email, password);
    if (result.error) {
      setFormError(result.error);
      return;
    }

    router.replace('/');
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue your streak and keep your progress tied to your account."
      footer={
        <AuthFooterPrompt
          prompt="New to Sober Streak?"
          actionLabel="Create an account"
          onPress={() => router.push('/(auth)/signup' as Href)}
          disabled={loading}
        />
      }
    >
      <AuthFormCard>
        {formError ? <AuthBanner message={formError} /> : null}

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
          placeholder="Your password"
          error={passwordError}
          secureTextEntry
          returnKeyType="done"
          onSubmitEditing={handleSignIn}
        />

        <AuthInlineLink
          label="Forgot password?"
          onPress={() => router.push('/(auth)/forgot-password' as Href)}
          disabled={loading}
        />

        <Button title="Sign in" onPress={handleSignIn} loading={loading} />
      </AuthFormCard>
    </AuthShell>
  );
}
