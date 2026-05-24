import { Href, Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { themedIconWrap } from '../../lib/themeStyles';
import { ThemedText } from '../../components/ui/ThemedText';
import { useAuthStore } from '../../store/useAuthStore';

export default function AuthIndexScreen() {
  const { colors, isDark } = useAppTheme();
  const initialized = useAuthStore((s) => s.initialized);
  const user = useAuthStore((s) => s.user);

  if (!initialized) {
    return (
      <View
        className="flex-1 items-center justify-center px-8"
        style={{ backgroundColor: colors.background }}
      >
        <View
          className="mb-6 h-20 w-20 items-center justify-center rounded-full"
          style={themedIconWrap(colors, isDark, 'primary')}
        >
          <Sparkles size={36} color={colors.primaryStrong} />
        </View>
        <ActivityIndicator size="large" color={colors.primaryStrong} />
        <ThemedText variant="muted" className="mt-4 text-sm">
          Loading your session…
        </ThemedText>
      </View>
    );
  }

  if (user) {
    return <Redirect href="/" />;
  }

  return <Redirect href={'/(auth)/login' as Href} />;
}
