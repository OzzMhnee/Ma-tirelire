import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '@/theme/ThemeProvider';

type Props = {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
};

export function Section({ title, action, children }: Props) {
  const { theme: { colors } } = useAppTheme();

  return (
    <View style={styles.container}>
      {(title || action) && (
        <View style={styles.header}>
          {title ? <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>{title}</Text> : <View />}
          {action}
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12, marginBottom: 8 },
  header:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
