export interface AppThemeColors {
  background: string;
  surface: string;
  card: string;
  border: string;
  text: string;
  mutedText: string;
  primary: string;
  primaryStrong: string;
  secondary: string;
  danger: string;
  /** Text on dark accent surfaces (light mode hero). */
  onAccent: string;
  /** Muted text on dark accent surfaces. */
  onAccentMuted: string;
}

/** Brand palette — user-defined navy scale */
export const lightPalette = {
  deep: '#0C2B4E',
  mid: '#1A3D64',
  teal: '#1D546C',
  canvas: '#F4F4F4',
} as const;

/** Light: soft gray canvas, navy typography, teal accents */
export const lightTheme: AppThemeColors = {
  background: lightPalette.canvas,
  surface: '#FFFFFF',
  card: '#FFFFFF',
  border: 'rgba(12, 43, 78, 0.1)',
  text: lightPalette.deep,
  mutedText: lightPalette.teal,
  primary: lightPalette.teal,
  primaryStrong: lightPalette.deep,
  secondary: '#2A8F6F',
  danger: '#C45C4A',
  onAccent: '#F4F4F4',
  onAccentMuted: 'rgba(244, 244, 244, 0.72)',
};

export const darkTheme: AppThemeColors = {
  background: '#050505',
  surface: '#111111',
  card: '#181818',
  border: '#2A2A2A',
  text: '#FFFFFF',
  mutedText: '#A3A3A3',
  primary: '#F97316',
  primaryStrong: '#FB923C',
  secondary: '#22C55E',
  danger: '#EF4444',
  onAccent: '#FFFFFF',
  onAccentMuted: 'rgba(255, 255, 255, 0.7)',
};

export const themes = {
  light: lightTheme,
  dark: darkTheme,
};
