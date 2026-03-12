import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '@/theme/ThemeProvider';

type Tone = 'info' | 'success' | 'warning' | 'danger' | 'error';

type Props = {
  title?: string;
  message: string | null | undefined;
  tone?: Tone;
  type?: Tone;   // alias rétro-compat
};

const toneBg: Record<string, string> = {
  info:    '#e0f2fe',
  success: '#dcfce7',
  warning: '#fef3c7',
  danger:  '#fee2e2',
  error:   '#fee2e2',
};

const toneText: Record<string, string> = {
  info:    '#075985',
  success: '#166534',
  warning: '#92400e',
  danger:  '#991b1b',
  error:   '#991b1b',
};

export function InlineAlert({ title, message, tone, type }: Props) {
  if (!message) return null;
  const { theme: { colors } } = useAppTheme();
  const usedTone = tone ?? type ?? 'error';

  return (
    <View
      style={[styles.container, { backgroundColor: toneBg[usedTone], borderColor: colors.outline }]}
    >
      {title ? <Text style={{ color: toneText[usedTone], fontWeight: '700' }}>{title}</Text> : null}
      <Text style={{ color: toneText[usedTone] }}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    gap: 4,
    marginBottom: 8,
  },
});
