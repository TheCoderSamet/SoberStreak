import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAppTheme } from '../hooks/useAppTheme';
import { useAuthStore } from '../store/useAuthStore';

export function RootLayoutNav() {
  const { isDark } = useAppTheme();
  const initialized = useAuthStore((s) => s.initialized);
  const user = useAuthStore((s) => s.user);
  const isSignedIn = initialized && Boolean(user);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />

        <Stack.Protected guard={!isSignedIn}>
          <Stack.Screen name="(auth)" options={{ gestureEnabled: false }} />
        </Stack.Protected>

        <Stack.Protected guard={isSignedIn}>
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="account" />
          <Stack.Screen name="preferences" />
          <Stack.Screen name="data-privacy" />
          <Stack.Screen name="emergency" options={{ presentation: 'modal' }} />
          <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
          <Stack.Screen name="milestones" />
          <Stack.Screen name="statistics" />
          <Stack.Screen name="community" />
          <Stack.Screen name="relapse" />
          <Stack.Screen name="add-habit" />
          <Stack.Screen name="manage-habits" />
          <Stack.Screen name="habit/[id]" />
          <Stack.Screen name="edit-habit/[id]" />
        </Stack.Protected>
      </Stack>
    </>
  );
}
