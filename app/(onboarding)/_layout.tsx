import { Stack } from 'expo-router';
import { StoreHydrationGate } from '../../components/StoreHydrationGate';

export default function OnboardingLayout() {
  return (
    <StoreHydrationGate>
      <Stack screenOptions={{ headerShown: false }} />
    </StoreHydrationGate>
  );
}
