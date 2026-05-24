import { useAppTheme } from '../hooks/useAppTheme';
import { ThemedText } from './ui/ThemedText';

export interface FormErrorProps {
  message?: string | null;
}

export function FormError({ message }: FormErrorProps) {
  const { colors } = useAppTheme();

  if (!message) return null;

  return (
    <ThemedText className="mt-1.5 text-sm leading-5" style={{ color: colors.danger }}>
      {message}
    </ThemedText>
  );
}
