import type { LucideIcon } from 'lucide-react-native';
import { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { lightPalette } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import { getSurfaceStyle, themedIconWrap } from '../../lib/themeStyles';
import { BackButton } from '../ui/BackButton';
import { ScreenContainer } from '../ui/ScreenContainer';
import { ThemedText } from '../ui/ThemedText';

export interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  heroIcon?: LucideIcon;
}

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  showBack = false,
  onBack,
  heroIcon: HeroIcon = Sparkles,
}: AuthShellProps) {
  const { colors, isDark } = useAppTheme();

  return (
    <ScreenContainer scroll keyboardAware tabBarInset={false} contentClassName="pb-10">
      <View
        pointerEvents="none"
        className="absolute -right-16 -top-10 h-52 w-52 rounded-full opacity-100"
        style={{ backgroundColor: isDark ? `${colors.primaryStrong}10` : `${lightPalette.teal}14` }}
      />
      <View
        pointerEvents="none"
        className="absolute -left-20 top-32 h-40 w-40 rounded-full opacity-100"
        style={{ backgroundColor: isDark ? `${colors.secondary}08` : `${lightPalette.mid}10` }}
      />

      {showBack && onBack ? (
        <BackButton onPress={onBack} className="mb-3 self-start" />
      ) : null}

      <View className="items-center pb-6 pt-2">
        <View
          className="mb-5 h-[72px] w-[72px] items-center justify-center rounded-full"
          style={themedIconWrap(colors, isDark, 'primary')}
        >
          <HeroIcon size={34} color={colors.primaryStrong} />
        </View>
        <ThemedText variant="muted" className="text-xs font-semibold uppercase tracking-[0.2em]">
          Sober Streak
        </ThemedText>
        <ThemedText variant="title" className="mt-2 text-center text-3xl font-bold">
          {title}
        </ThemedText>
        <ThemedText variant="muted" className="mt-2 max-w-[300px] text-center text-base leading-6">
          {subtitle}
        </ThemedText>
      </View>

      {children}

      {footer ? <View className="mt-8">{footer}</View> : null}

      <ThemedText variant="muted" className="mt-8 text-center text-[11px] leading-4">
        Your habits are saved to your account when you sign in.
      </ThemedText>
    </ScreenContainer>
  );
}

export interface AuthFormCardProps {
  children: ReactNode;
}

export function AuthFormCard({ children }: AuthFormCardProps) {
  const { colors, isDark } = useAppTheme();

  return (
    <View className="gap-4 rounded-3xl p-5" style={getSurfaceStyle(colors, isDark)}>
      {children}
    </View>
  );
}

export interface AuthBannerProps {
  message: string;
  variant?: 'error' | 'info';
}

export function AuthBanner({ message, variant = 'error' }: AuthBannerProps) {
  const { colors } = useAppTheme();
  const isError = variant === 'error';

  return (
    <View
      className="rounded-2xl px-3.5 py-3"
      style={{
        backgroundColor: isError ? `${colors.danger}14` : `${colors.primary}14`,
        borderWidth: isError ? 1 : 0,
        borderColor: isError ? `${colors.danger}40` : 'transparent',
      }}
    >
      <ThemedText
        className="text-sm leading-5"
        style={{ color: isError ? colors.danger : colors.primaryStrong }}
      >
        {message}
      </ThemedText>
    </View>
  );
}

export interface AuthFooterPromptProps {
  prompt: string;
  actionLabel: string;
  onPress: () => void;
  disabled?: boolean;
}

export function AuthFooterPrompt({ prompt, actionLabel, onPress, disabled }: AuthFooterPromptProps) {
  return (
    <View className="items-center gap-1">
      <ThemedText variant="muted" className="text-sm">
        {prompt}
      </ThemedText>
      <Pressable onPress={onPress} disabled={disabled} className="active:opacity-70">
        <ThemedText variant="primary" className="text-base font-semibold">
          {actionLabel}
        </ThemedText>
      </Pressable>
    </View>
  );
}

export function AuthInlineLink({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable onPress={onPress} disabled={disabled} className="self-end active:opacity-70">
      <ThemedText variant="primary" className="text-sm font-medium">
        {label}
      </ThemedText>
    </Pressable>
  );
}
