import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../hooks/useAppTheme';

export interface ScreenContainerProps {
  children: ReactNode;
  scroll?: boolean;
  /** @deprecated Use `scroll` instead */
  scrollable?: boolean;
  className?: string;
  contentClassName?: string;
  /** Extra bottom space for floating tab bar (tab screens). */
  tabBarInset?: boolean;
  keyboardAware?: boolean;
}

export const TAB_BAR_BOTTOM_PADDING = 120;
export const STACK_BOTTOM_PADDING = 32;

export function ScreenContainer({
  children,
  scroll = false,
  scrollable,
  className = '',
  contentClassName = '',
  tabBarInset = true,
  keyboardAware = false,
}: ScreenContainerProps) {
  const { colors } = useAppTheme();
  const shouldScroll = scrollable ?? scroll;
  const bottomPadding = tabBarInset ? TAB_BAR_BOTTOM_PADDING : STACK_BOTTOM_PADDING;

  const inner = (
    <View className={`flex-1 px-5 pt-4 ${contentClassName}`}>{children}</View>
  );

  const scrollBody = shouldScroll ? (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerStyle={{ flexGrow: 1, paddingBottom: bottomPadding }}
    >
      {inner}
    </ScrollView>
  ) : (
    <View style={{ flex: 1, paddingBottom: bottomPadding }}>{inner}</View>
  );

  const body = keyboardAware ? (
    <KeyboardAvoidingView
      className="flex-1"
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 4 : 0}
    >
      {scrollBody}
    </KeyboardAvoidingView>
  ) : (
    scrollBody
  );

  return (
    <SafeAreaView
      className={`flex-1 ${className}`}
      style={{ backgroundColor: colors.background }}
      edges={['top', 'bottom']}
    >
      {body}
    </SafeAreaView>
  );
}
