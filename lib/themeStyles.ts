import { lightPalette, AppThemeColors } from '../constants/theme';
import type { ViewStyle } from 'react-native';

export type ThemeAccent = 'neutral' | 'primary' | 'success' | 'danger';

function accentColor(colors: AppThemeColors, accent: ThemeAccent): string {
  switch (accent) {
    case 'primary':
      return colors.primaryStrong;
    case 'success':
      return colors.secondary;
    case 'danger':
      return colors.danger;
    default:
      return colors.border;
  }
}

/** Card / box — light: soft fill; dark: tinted surfaces */
export function themedBox(
  colors: AppThemeColors,
  isDark: boolean,
  options: { accent?: ThemeAccent; selected?: boolean; fill?: 'card' | 'surface' } = {}
): {
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
} {
  const { accent = 'neutral', selected = false, fill = 'card' } = options;
  const accentHex = accentColor(colors, accent);
  const baseFill = fill === 'surface' ? colors.surface : colors.card;

  if (isDark) {
    const tinted =
      accent === 'primary'
        ? `${colors.primaryStrong}18`
        : accent === 'success'
          ? `${colors.secondary}12`
          : accent === 'danger'
            ? `${colors.danger}15`
            : baseFill;

    return {
      backgroundColor: selected || accent !== 'neutral' ? tinted : baseFill,
      borderColor: selected ? colors.primaryStrong : accentHex,
      borderWidth: selected ? 1.5 : 1,
    };
  }

  const tinted =
    accent === 'primary'
      ? `${lightPalette.teal}14`
      : accent === 'success'
        ? `${colors.secondary}14`
        : accent === 'danger'
          ? `${colors.danger}10`
          : baseFill;

  return {
    backgroundColor: selected || accent !== 'neutral' ? tinted : baseFill,
    borderColor: selected ? lightPalette.mid : colors.border,
    borderWidth: selected ? 1.5 : 1,
  };
}

/** Icon / pill wrapper */
export function themedIconWrap(
  colors: AppThemeColors,
  isDark: boolean,
  accent: ThemeAccent = 'primary'
): { backgroundColor: string; borderColor: string; borderWidth: number } {
  const accentHex = accentColor(colors, accent);

  if (isDark) {
    return {
      backgroundColor: `${accentHex}18`,
      borderColor: `${accentHex}33`,
      borderWidth: 1,
    };
  }

  const fill =
    accent === 'primary'
      ? `${lightPalette.teal}18`
      : accent === 'success'
        ? `${colors.secondary}16`
        : accent === 'danger'
          ? `${colors.danger}12`
          : colors.surface;

  return {
    backgroundColor: fill,
    borderColor: 'transparent',
    borderWidth: 0,
  };
}

/** Light-mode card elevation (navy-tinted shadow). */
export const lightCardShadow = {
  shadowColor: lightPalette.deep,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 14,
  elevation: 3,
} as const;

/** Standard elevated surface (cards, rows) — light: white + shadow; dark: bordered surface. */
export function getSurfaceStyle(
  colors: AppThemeColors,
  isDark: boolean,
  options: { fill?: 'card' | 'surface' } = {}
): ViewStyle {
  const fill = options.fill === 'surface' ? colors.surface : colors.card;
  if (isDark) {
    return {
      backgroundColor: fill,
      borderWidth: 1,
      borderColor: colors.border,
    };
  }
  return {
    backgroundColor: fill,
    borderWidth: 0,
    ...lightCardShadow,
  };
}

/** Small tag / chip pill (triggers, labels). */
export function tagChipStyle(colors: AppThemeColors, isDark: boolean): ViewStyle {
  if (isDark) {
    return {
      borderColor: colors.border,
      backgroundColor: colors.surface,
      borderWidth: 1,
    };
  }
  return {
    backgroundColor: `${lightPalette.teal}12`,
    borderWidth: 0,
  };
}

/** Currency / numeric input row. */
export function getMoneyInputStyle(
  colors: AppThemeColors,
  isDark: boolean,
  hasError = false
): ViewStyle {
  const base = getSurfaceStyle(colors, isDark, { fill: 'surface' });
  if (hasError) {
    return { ...base, borderWidth: 1, borderColor: colors.danger };
  }
  return base;
}

/** Status pill (Signed in, Premium, Active). */
export function statusPillStyle(
  colors: AppThemeColors,
  isDark: boolean,
  tone: 'neutral' | 'primary' | 'success' = 'neutral'
): ViewStyle {
  if (isDark) {
    const map = {
      neutral: { bg: colors.surface, border: colors.border },
      primary: { bg: `${colors.primaryStrong}18`, border: `${colors.primaryStrong}44` },
      success: { bg: `${colors.secondary}12`, border: `${colors.secondary}44` },
    };
    const t = map[tone];
    return { backgroundColor: t.bg, borderColor: t.border, borderWidth: 1 };
  }
  const map = {
    neutral: { bg: `${lightPalette.teal}10` },
    primary: { bg: `${lightPalette.teal}16` },
    success: { bg: `${colors.secondary}14` },
  };
  return { backgroundColor: map[tone].bg, borderWidth: 0 };
}
