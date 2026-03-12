import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '@/theme/ThemeProvider';

type Tone = 'neutral' | 'success' | 'warning' | 'danger';

type Props = {
  label: string;
  tone?: Tone;
  /** Alias rétro-compat ("error"→danger, "default"→neutral) */
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
};

const bgMap: Record<Tone, string> = {
  neutral: '',   // sera rempli depuis colors
  success: '#dcfce7',
  warning: '#fef3c7',
  danger:  '#fee2e2',
};

const textMap: Record<Tone, string> = {
  neutral: '',   // sera rempli depuis colors
  success: '#166534',
  warning: '#92400e',
  danger:  '#991b1b',
};

export function Badge({ label, tone, variant }: Props) {
  const { theme: { colors } } = useAppTheme();

  // Résoudre le tone depuis variant si tone absent
  const resolvedTone: Tone =
    tone ??
    (variant === 'error' ? 'danger' : variant === 'default' || !variant ? 'neutral' : variant as Tone);

  const bg   = resolvedTone === 'neutral' ? colors.muted    : bgMap[resolvedTone];
  const txc  = resolvedTone === 'neutral' ? colors.text     : textMap[resolvedTone];

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={{ color: txc, fontWeight: '600', fontSize: 12 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
});
