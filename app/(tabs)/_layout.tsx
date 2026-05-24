import { Redirect, Tabs } from 'expo-router';
import { GlassTabBar } from '../../components/GlassTabBar';
import { hasFinishedOnboarding } from '../../lib/onboardingState';
import { useUserStore } from '../../store/useUserStore';

export default function TabsLayout() {
  const profile = useUserStore((s) => s.profile);

  if (!hasFinishedOnboarding(profile)) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  return (
    <Tabs
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="health" options={{ title: 'Health' }} />
      <Tabs.Screen name="journal" options={{ title: 'Journal' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
