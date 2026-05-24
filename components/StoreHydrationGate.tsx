import { ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAppStoresHydrated } from '../hooks/useStoreHydration';
import { useAppTheme } from '../hooks/useAppTheme';
import { ThemedText } from './ui/ThemedText';

export interface StoreHydrationGateProps {
  children: ReactNode;
}

export function StoreHydrationGate({ children }: StoreHydrationGateProps) {
  const { colors } = useAppTheme();
  const storesReady = useAppStoresHydrated();

  if (!storesReady) {
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

  return children;
}
