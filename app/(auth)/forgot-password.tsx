import { Href, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyRound, Mail } from 'lucide-react-native';
import {
  AuthBanner,
  AuthFooterPrompt,
  AuthFormCard,
  AuthShell,
} from '../../components/auth/AuthShell';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { validateEmail } from '../../lib/validation';
import { useAuthStore } from '../../store/useAuthStore';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const loading = useAuthStore((s) => s.loading);
  const resetPassword = useAuthStore((s) => s.resetPassword);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      setSent(false);
      return;
    }

    const result = await resetPassword(email);
    if (result.error) {
      setError(result.error);
      setSent(false);
      return;
    }

    setError(null);
    setSent(true);
  };

  return (
    <AuthShell
      showBack
      onBack={() => router.back()}
      heroIcon={KeyRound}
      title="Reset password"
      subtitle="Enter your email and we will send a secure link to choose a new password."
      footer={
        <AuthFooterPrompt
          prompt="Remember your password?"
          actionLabel="Back to sign in"
          onPress={() => router.replace('/(auth)/login' as Href)}
          disabled={loading}
        />
      }
    >
      <AuthFormCard>
        {sent ? (
          <AuthBanner
            variant="info"
            message="If an account exists for this email, you will receive a reset link shortly. Check spam if you do not see it."
          />
        ) : null}

        <TextField
          label="Email"
          leftIcon={Mail}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setError(null);
            setSent(false);
          }}
          placeholder="you@example.com"
          error={error}
          keyboardType="email-address"
          autoCapitalize="none"
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />

        <Button
          title={sent ? 'Resend link' : 'Send reset link'}
          onPress={handleSubmit}
          loading={loading}
        />
      </AuthFormCard>
    </AuthShell>
  );
}
