// Palette de couleurs partagée (correspond à tailwind.config.js)
export const COLORS = {
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
  },
  success: {
    50: '#F0FDF4',
    500: '#22C55E',
    600: '#16A34A',
  },
  warning: {
    50: '#FFFBEB',
    500: '#F59E0B',
  },
  danger: {
    50: '#FEF2F2',
    500: '#EF4444',
    600: '#DC2626',
  },
  kids: {
    purple: '#9333EA',
    orange: '#F97316',
    pink: '#EC4899',
    yellow: '#EAB308',
  },
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    400: '#9CA3AF',
    500: '#6B7280',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  white: '#FFFFFF',
  black: '#000000',
} as const;

// Thèmes nommés
export type ThemeName = 'light' | 'dark' | 'kids';

export interface AppTheme {
  name: ThemeName;
  primary: string;
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  muted: string;
  subtle: string;
  outline: string;
  success: string;
  warning: string;
  danger: string;
}

export const THEMES: Record<ThemeName, AppTheme> = {
  light: {
    name: 'light',
    primary: COLORS.primary[500],
    background: COLORS.neutral[50],
    surface: COLORS.white,
    card: COLORS.white,
    text: COLORS.neutral[900],
    textSecondary: COLORS.neutral[500],
    muted: COLORS.neutral[400],
    subtle: COLORS.neutral[100],
    outline: COLORS.neutral[200],
    success: COLORS.success[500],
    warning: COLORS.warning[500],
    danger: COLORS.danger[500],
  },
  dark: {
    name: 'dark',
    primary: COLORS.primary[400],
    background: COLORS.neutral[900],
    surface: COLORS.neutral[800],
    card: COLORS.neutral[800],
    text: COLORS.neutral[50],
    textSecondary: COLORS.neutral[400],
    muted: COLORS.neutral[500],
    subtle: COLORS.neutral[700],
    outline: COLORS.neutral[700],
    success: COLORS.success[500],
    warning: COLORS.warning[500],
    danger: COLORS.danger[500],
  },
  kids: {
    name: 'kids',
    primary: COLORS.kids.purple,
    background: '#FFF9F0',
    surface: COLORS.white,
    card: COLORS.white,
    text: COLORS.neutral[900],
    textSecondary: COLORS.neutral[500],
    muted: COLORS.neutral[400],
    subtle: '#FFF0DD',
    outline: '#FFD9A3',
    success: COLORS.success[500],
    warning: COLORS.kids.orange,
    danger: COLORS.danger[500],
  },
};
