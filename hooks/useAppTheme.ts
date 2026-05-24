import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme, AppThemeColors } from '../constants/theme';
import { useThemeStore } from '../store/useThemeStore';
import { ThemeMode } from '../types';

export interface AppThemeResult {
  mode: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  colors: AppThemeColors;
  isDark: boolean;
}

export function useAppTheme(): AppThemeResult {
  const mode = useThemeStore((s) => s.mode);
  const systemScheme = useColorScheme();

  const resolvedTheme: 'light' | 'dark' =
    mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;

  const colors = resolvedTheme === 'dark' ? darkTheme : lightTheme;

  return {
    mode,
    resolvedTheme,
    colors,
    isDark: resolvedTheme === 'dark',
  };
}
