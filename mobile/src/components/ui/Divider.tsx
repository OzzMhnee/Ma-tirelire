import React from 'react';
import { View } from 'react-native';
import { useAppTheme } from '@/theme/ThemeProvider';

export function Divider() {
  const { theme: { colors } } = useAppTheme();
  return <View style={{ height: 1, backgroundColor: colors.outline, opacity: 0.6 }} />;
}
