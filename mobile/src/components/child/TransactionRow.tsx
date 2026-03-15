import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '@/theme/ThemeProvider';
import { formatSignedCurrency, formatDate } from '@utils/format';
import type { Transaction } from '@/types/domain.types';

type Props = {
  transaction: Transaction;
};

export function TransactionRow({ transaction }: Props) {
  const { theme: { colors } } = useAppTheme();
  const isPositive = transaction.amount > 0;

  return (
    <View style={[styles.row, { borderBottomColor: colors.outline }]}>
      <View style={styles.left}>
        <Text style={[styles.description, { color: colors.text }]} numberOfLines={1}>
          {transaction.description}
        </Text>
        <Text style={[styles.date, { color: colors.muted }]}>
          {formatDate(transaction.createdAt)}
        </Text>
      </View>
      <Text style={[styles.amount, { color: isPositive ? colors.success : colors.danger }]}>
        {formatSignedCurrency(transaction.amount)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  left: {
    flex: 1,
    marginRight: 12,
  },
  description: {
    fontSize: 14,
    fontWeight: '500',
  },
  date: {
    fontSize: 12,
    marginTop: 2,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
  },
});
