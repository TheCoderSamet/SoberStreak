import { Switch as RNSwitch, SwitchProps as RNSwitchProps, View } from 'react-native';
import { lightPalette } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';

export interface SwitchProps extends Omit<RNSwitchProps, 'trackColor' | 'thumbColor' | 'ios_backgroundColor'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export function Switch({
  checked,
  value,
  onCheckedChange,
  onValueChange,
  disabled,
  ...rest
}: SwitchProps) {
  const { colors, isDark } = useAppTheme();
  const isOn = value ?? checked ?? false;

  const handleChange = (next: boolean) => {
    onValueChange?.(next);
    onCheckedChange?.(next);
  };

  const trackOff = isDark ? '#3A3A3A' : `${lightPalette.teal}33`;

  return (
    <View style={{ opacity: disabled ? 0.45 : 1 }}>
      <RNSwitch
        value={isOn}
        onValueChange={handleChange}
        disabled={disabled}
        trackColor={{
          false: trackOff,
          true: colors.primaryStrong,
        }}
        thumbColor="#FFFFFF"
        ios_backgroundColor={trackOff}
        {...rest}
      />
    </View>
  );
}
