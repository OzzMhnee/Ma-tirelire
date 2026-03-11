import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

type Type = 'error' | 'warning' | 'info' | 'success';

const COLORS: Record<Type, { bg: string; border: string; text: string }> = {
  error:   { bg: '#ffebee', border: '#f44336', text: '#b71c1c' },
  warning: { bg: '#fff8e1', border: '#ff9800', text: '#e65100' },
  info:    { bg: '#e3f2fd', border: '#2196f3', text: '#0d47a1' },
  success: { bg: '#e8f5e9', border: '#4caf50', text: '#1b5e20' },
};

interface Props {
  message: string | null | undefined;
  type?: Type;
}

export function InlineAlert({ message, type = 'error' }: Props) {
  if (!message) return null;
  const c = COLORS[type];
  return (
    <View style={[styles.container, { backgroundColor: c.bg, borderLeftColor: c.border }]}>
      <Text style={{ color: c.text, fontSize: 13 }}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderLeftWidth: 4,
    borderRadius: 4,
    padding: 10,
    marginVertical: 6,
  },
});
