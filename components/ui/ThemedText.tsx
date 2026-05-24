import { ReactNode } from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';

export type ThemedTextVariant =
  | 'title'
  | 'subtitle'
  | 'body'
  | 'muted'
  | 'danger'
  | 'success'
  | 'primary'
  | 'default';

export interface ThemedTextProps extends TextProps {
  children: ReactNode;
  variant?: ThemedTextVariant;
  className?: string;
}

export function ThemedText({
  children,
  variant = 'body',
  className = '',
  style,
  ...rest
}: ThemedTextProps) {
  const { colors } = useAppTheme();

  const resolvedVariant = variant === 'default' ? 'body' : variant;

  const colorMap: Record<Exclude<ThemedTextVariant, 'default'>, string> = {
    title: colors.text,
    subtitle: colors.mutedText,
    body: colors.text,
    muted: colors.mutedText,
    primary: colors.primaryStrong,
    success: colors.secondary,
    danger: colors.danger,
  };

  return (
    <Text
      className={className}
      style={[{ color: colorMap[resolvedVariant] }, style as TextStyle]}
      {...rest}
    >
      {children}
    </Text>
  );
}

/** Convenience alias for helper / caption text */
export function MutedText({ children, className = '', ...rest }: Omit<ThemedTextProps, 'variant'>) {
  return (
    <ThemedText variant="muted" className={className} {...rest}>
      {children}
    </ThemedText>
  );
}
