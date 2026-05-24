import { Linking, Pressable, View } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { SupportResource } from '../constants/supportResources';
import { getSurfaceStyle } from '../lib/themeStyles';
import { ThemedText } from './ui/ThemedText';

export interface SupportResourceCardProps {
  resource: SupportResource;
}

export function SupportResourceCard({ resource }: SupportResourceCardProps) {
  const { colors, isDark } = useAppTheme();

  const handleCall = () => {
    if (resource.phone) {
      Linking.openURL(`tel:${resource.phone}`);
    }
  };

  const handleWebsite = () => {
    if (resource.url) {
      Linking.openURL(resource.url);
    }
  };

  return (
    <View className="mb-3 rounded-2xl p-4" style={getSurfaceStyle(colors, isDark)}>
      <ThemedText variant="title" className="text-lg font-semibold">
        {resource.name}
      </ThemedText>
      <ThemedText variant="muted" className="mt-1 text-sm">
        {resource.description}
      </ThemedText>
      <View className="mt-3 flex-row gap-2">
        {resource.phone ? (
          <Pressable
            onPress={handleCall}
            className="flex-1 rounded-xl px-3 py-2.5"
            style={{ backgroundColor: `${colors.danger}16` }}
          >
            <ThemedText variant="danger" className="text-center font-semibold">
              Call {resource.phone}
            </ThemedText>
          </Pressable>
        ) : null}
        {resource.url ? (
          <Pressable
            onPress={handleWebsite}
            className="flex-1 rounded-xl px-3 py-2.5"
            style={{ backgroundColor: `${colors.primary}14` }}
          >
            <ThemedText variant="primary" className="text-center text-sm font-semibold">
              Website
            </ThemedText>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
