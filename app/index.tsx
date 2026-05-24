import { Href, Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { useAppStoresHydrated } from '../hooks/useStoreHydration';
import { hasFinishedOnboarding } from '../lib/onboardingState';
import { ThemedText } from '../components/ui/ThemedText';
import { useAuthStore } from '../store/useAuthStore';
import { useUserStore } from '../store/useUserStore';

function IndexRedirect() {
  const initialized = useAuthStore((s) => s.initialized);
  const user = useAuthStore((s) => s.user);
  const profileBootstrapReady = useAuthStore((s) => s.profileBootstrapReady);
  const storesReady = useAppStoresHydrated();
  const profile = useUserStore((s) => s.profile);
  const { colors } = useAppTheme();

  if (!initialized || !storesReady || (user && !profileBootstrapReady)) {
    return (
      <View
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: colors.background }}
      >
        <ActivityIndicator size="large" color={colors.primaryStrong} />
        <ThemedText variant="muted" className="mt-4 text-center text-sm">
          Loading Sober Streak…
        </ThemedText>
      </View>
    );
  }

  if (!user) {
    return <Redirect href={'/(auth)/login' as Href} />;
  }

  if (!hasFinishedOnboarding(profile)) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  return <Redirect href="/(tabs)" />;
}

export default function Index() {
  return <IndexRedirect />;
}
