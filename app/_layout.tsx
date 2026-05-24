import '../global.css';

import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootLayoutNav } from '../components/RootLayoutNav';
import { usePremiumSync } from '../hooks/usePremiumSync';
import { useAuthStore } from '../store/useAuthStore';

export default function RootLayout() {
  const initializeAuth = useAuthStore((s) => s.initializeAuth);

  useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

  usePremiumSync();

  return (
    <SafeAreaProvider>
      <RootLayoutNav />
    </SafeAreaProvider>
  );
}
