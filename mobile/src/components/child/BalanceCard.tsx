import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '@/theme/ThemeProvider';
import { formatCurrency } from '@utils/format';

type Props = {
  balance: number;
  label: string;
};

export function BalanceCard({ balance, label }: Props) {
  const { theme: { colors } } = useAppTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
      <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
      <Text style={[styles.amount, { color: colors.success }]}>{formatCurrency(balance)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  amount: {
    fontSize: 32,
    fontWeight: '800',
  },
});
