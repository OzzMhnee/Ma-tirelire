import { MD3LightTheme as DefaultLightTheme, MD3DarkTheme as DefaultDarkTheme } from 'react-native-paper';

export type ThemeKey = 'light' | 'dark' | 'kids';

export type AppTheme = {
  key: ThemeKey;
  colors: {
    primary: string;
    background: string;
    surface: string;
    text: string;
    muted: string;
    outline: string;
    success: string;
    warning: string;
    danger: string;
  };
  paper: typeof DefaultLightTheme;
};

const common = {
  muted: '#eef2f8',
  outline: '#e5e7eb',
  success: '#14b8a6',
  warning: '#f59e0b',
  danger: '#ef4444',
};

export const lightTheme: AppTheme = {
  key: 'light',
  colors: {
    primary: '#2563eb',
    background: '#f5f7fb',
    surface: '#ffffff',
    text: '#111827',
    muted: common.muted,
    outline: common.outline,
    success: common.success,
    warning: common.warning,
    danger: common.danger,
  },
  paper: {
    ...DefaultLightTheme,
    colors: {
      ...DefaultLightTheme.colors,
      primary: '#2563eb',
      background: '#f5f7fb',
      surface: '#ffffff',
      onSurface: '#111827',
      onBackground: '#111827',
    },
  },
};

export const darkTheme: AppTheme = {
  key: 'dark',
  colors: {
    primary: '#7ba8ff',
    background: '#0b1220',
    surface: '#0f172a',
    text: '#ffffffff',
    muted: '#1c2536',
    outline: '#1f2937',
    success: common.success,
    warning: common.warning,
    danger: common.danger,
  },
  paper: {
    ...DefaultDarkTheme,
    colors: {
      ...DefaultDarkTheme.colors,
      primary: '#7ba8ff',
      background: '#0b1220',
      surface: '#0f172a',
    },
  },
};

export const kidsTheme: AppTheme = {
  key: 'kids',
  colors: {
    primary: '#4c89ff',
    background: '#f1f4ff',
    surface: '#ffffff',
    text: '#111827',
    muted: '#e8edff',
    outline: '#dbe3ff',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
  },
  paper: {
    ...DefaultLightTheme,
    colors: {
      ...DefaultLightTheme.colors,
      primary: '#4c89ff',
      background: '#f1f4ff',
      surface: '#ffffff',
    },
  },
};

export const themes: Record<ThemeKey, AppTheme> = {
  light: lightTheme,
  dark: darkTheme,
  kids: kidsTheme,
};
