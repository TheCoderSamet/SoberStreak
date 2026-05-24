import type { LucideIcon } from 'lucide-react-native';
import { Platform, TextInput, TextInputProps, View } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { getSurfaceStyle } from '../../lib/themeStyles';
import { FormError } from '../FormError';
import { ThemedText } from './ThemedText';

export interface TextFieldProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string | null;
  leftIcon?: LucideIcon;
  keyboardType?: TextInputProps['keyboardType'];
  multiline?: boolean;
  secureTextEntry?: boolean;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  returnKeyType?: TextInputProps['returnKeyType'];
  onSubmitEditing?: TextInputProps['onSubmitEditing'];
  maxLength?: number;
  className?: string;
}

const SINGLE_LINE_MIN_HEIGHT = 52;
const FONT_SIZE = 16;
const LINE_HEIGHT = 22;

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  keyboardType,
  multiline = false,
  secureTextEntry = false,
  leftIcon: LeftIcon,
  autoCapitalize,
  returnKeyType,
  onSubmitEditing,
  maxLength,
  className = '',
}: TextFieldProps) {
  const { colors, isDark } = useAppTheme();
  const hasError = Boolean(error);

  const fieldStyle = getSurfaceStyle(colors, isDark, { fill: 'surface' });
  if (hasError) {
    fieldStyle.borderWidth = 1;
    fieldStyle.borderColor = colors.danger;
  }

  return (
    <View className={className}>
      {label ? (
        <ThemedText variant="muted" className="mb-2 text-sm font-medium">
          {label}
        </ThemedText>
      ) : null}
      <View
        className={`flex-row rounded-2xl ${multiline ? 'items-start' : ''}`}
        style={{
          ...fieldStyle,
          minHeight: multiline ? undefined : SINGLE_LINE_MIN_HEIGHT,
          alignItems: multiline ? 'flex-start' : 'center',
        }}
      >
        {LeftIcon ? (
          <View
            className="justify-center pl-3.5"
            style={multiline ? { paddingTop: 14 } : { minHeight: SINGLE_LINE_MIN_HEIGHT }}
          >
            <LeftIcon size={20} color={hasError ? colors.danger : colors.mutedText} />
          </View>
        ) : null}
        <TextInput
          className={`flex-1 ${multiline ? 'min-h-[100px] py-3 pr-4' : 'pr-4'} ${LeftIcon ? 'pl-2' : 'px-4'}`}
          style={{
            color: colors.text,
            fontSize: FONT_SIZE,
            lineHeight: multiline ? 22 : LINE_HEIGHT,
            minHeight: multiline ? 100 : SINGLE_LINE_MIN_HEIGHT,
            paddingVertical: multiline ? 12 : Platform.OS === 'ios' ? 15 : 13,
            textAlignVertical: multiline ? 'top' : 'center',
            ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
          }}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedText}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          multiline={multiline}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          maxLength={maxLength}
        />
      </View>
      <FormError message={error} />
    </View>
  );
}
