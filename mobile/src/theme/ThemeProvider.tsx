import React, { createContext, useContext, useMemo, useState } from 'react';
import { themes, ThemeKey, AppTheme, lightTheme } from './themes';

type ThemeContextValue = {
  theme: AppTheme;
  setTheme: (key: ThemeKey) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const useAppTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used within ThemeProvider');
  return ctx;
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [themeKey, setThemeKey] = useState<ThemeKey>('light');
  const theme = useMemo(() => themes[themeKey] || lightTheme, [themeKey]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeKey }}>
      {children}
    </ThemeContext.Provider>
  );
};
