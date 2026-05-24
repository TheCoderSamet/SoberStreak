import { format } from 'date-fns';
import { View } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { lightPalette } from '../../constants/theme';
import { themedIconWrap } from '../../lib/themeStyles';
import { ThemedText } from '../ui/ThemedText';

export interface HomeHeaderProps {
  greetingName: string;
  motivation: string;
}

export function HomeHeader({ greetingName, motivation }: HomeHeaderProps) {
  const { colors, isDark } = useAppTheme();
  const todayLabel = format(new Date(), 'EEEE, MMM d');

  return (
    <View className="mb-5">
      <View className="flex-row items-center justify-between">
        <View
          className="rounded-full px-3 py-1"
          style={
            isDark
              ? { backgroundColor: `${colors.primaryStrong}18` }
              : { backgroundColor: `${lightPalette.teal}18` }
          }
        >
          <ThemedText variant="primary" className="text-[11px] font-semibold uppercase tracking-wider">
            {todayLabel}
          </ThemedText>
        </View>
        <View className="rounded-full p-2" style={themedIconWrap(colors, isDark, 'primary')}>
          <Sparkles size={16} color={colors.primary} />
        </View>
      </View>

      <ThemedText className="mt-4 text-[28px] font-bold leading-8">
        Hey, {greetingName}
      </ThemedText>
      <ThemedText variant="muted" className="mt-2 text-[15px] leading-[22px]">
        {motivation}
      </ThemedText>
    </View>
  );
}
