import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../hooks/useAppTheme';
import { OnboardingProgress } from './OnboardingProgress';
import { ThemedText } from '../ui/ThemedText';

export interface OnboardingShellProps {
  title?: string;
  subtitle?: string;
  step?: number;
  totalSteps?: number;
  children: ReactNode;
  footer?: ReactNode;
  keyboardAware?: boolean;
}

function OnboardingHeader({
  step,
  totalSteps,
  title,
  subtitle,
}: Pick<OnboardingShellProps, 'step' | 'totalSteps' | 'title' | 'subtitle'>) {
  return (
    <>
      {step !== undefined ? (
        <OnboardingProgress step={step} totalSteps={totalSteps ?? 6} />
      ) : null}
      {title ? (
        <ThemedText variant="title" className="text-3xl font-bold">
          {title}
        </ThemedText>
      ) : null}
      {subtitle ? (
        <ThemedText variant="muted" className={`text-base leading-6 ${title ? 'mt-2' : ''}`}>
          {subtitle}
        </ThemedText>
      ) : null}
    </>
  );
}

export function OnboardingShell({
  title,
  subtitle,
  step,
  totalSteps = 6,
  children,
  footer,
  keyboardAware = false,
}: OnboardingShellProps) {
  const { colors, isDark } = useAppTheme();

  const body = (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 }}
      >
        <OnboardingHeader
          step={step}
          totalSteps={totalSteps}
          title={title}
          subtitle={subtitle}
        />
        <View className="mt-6">{children}</View>
      </ScrollView>

      {footer ? (
        <View
          className="px-5 pb-4 pt-3"
          style={
            isDark
              ? { borderTopWidth: 1, borderTopColor: colors.border }
              : { backgroundColor: colors.background }
          }
        >
          {footer}
        </View>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      edges={['top', 'bottom']}
    >
      {keyboardAware ? (
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
        >
          {body}
        </KeyboardAvoidingView>
      ) : (
        body
      )}
    </SafeAreaView>
  );
}
