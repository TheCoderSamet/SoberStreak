import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import {
  BookOpen,
  HeartPulse,
  Home,
  LucideIcon,
  Settings,
} from 'lucide-react-native';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../hooks/useAppTheme';

type TabRouteName = 'index' | 'health' | 'journal' | 'settings';

const TAB_CONFIG: Record<TabRouteName, { label: string; Icon: LucideIcon }> = {
  index: { label: 'Home', Icon: Home },
  health: { label: 'Health', Icon: HeartPulse },
  journal: { label: 'Journal', Icon: BookOpen },
  settings: { label: 'Settings', Icon: Settings },
};

export function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();

  const blurTint = isDark ? 'dark' : 'light';
  const blurIntensity = Platform.OS === 'ios' ? 36 : 28;
  const activePillBg = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(53, 88, 114, 0.1)';

  return (
    <View
      className="absolute bottom-0 left-0 right-0 px-4"
      style={{
        paddingBottom: Math.max(insets.bottom, 12),
        zIndex: 50,
        elevation: 50,
      }}
      pointerEvents="box-none"
    >
      <View style={styles.barFloat} className="overflow-hidden rounded-full">
        <BlurView
          intensity={blurIntensity}
          tint={blurTint}
          style={[styles.blurFill, { backgroundColor: 'transparent' }]}
        >
          <View className="flex-row items-center justify-between px-2 py-2">
            {state.routes.map((route, index) => {
              const routeName = route.name as TabRouteName;
              const config = TAB_CONFIG[routeName];
              if (!config) return null;

              const isFocused = state.index === index;
              const { Icon, label } = config;
              const iconColor = isFocused ? colors.primaryStrong : colors.mutedText;
              const labelColor = isFocused ? colors.primaryStrong : colors.mutedText;

              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name, route.params);
                }
              };

              return (
                <Pressable
                  key={route.key}
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={descriptors[route.key].options.tabBarAccessibilityLabel ?? label}
                  onPress={onPress}
                  onLongPress={() => {
                    navigation.emit({ type: 'tabLongPress', target: route.key });
                  }}
                  className="flex-1 items-center justify-center py-1"
                >
                  <View
                    className="items-center rounded-full px-3 py-2"
                    style={isFocused ? { backgroundColor: activePillBg } : undefined}
                  >
                    <Icon size={22} color={iconColor} strokeWidth={isFocused ? 2.5 : 2} />
                    <Text
                      className={`mt-1 text-[10px] ${isFocused ? 'font-semibold' : 'font-medium'}`}
                      style={{ color: labelColor }}
                    >
                      {label}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  barFloat: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  blurFill: {
    overflow: 'hidden',
  },
});
