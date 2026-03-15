import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ProgressBar } from 'react-native-paper';
import { useAppTheme } from '@/theme/ThemeProvider';
import { formatCurrency } from '@utils/format';
import type { WishlistItem } from '@/types/domain.types';

type Props = {
  item: WishlistItem;
  label: string;
  progressLabel: string;
};

export function WishProgressCard({ item, label, progressLabel }: Props) {
  const { theme: { colors } } = useAppTheme();
  const percent = item.progressPercent ?? 0;
  const progress = Math.min(percent / 100, 1);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
      <Text style={[styles.label, { color: colors.primary }]}>{label}</Text>
      <Text style={[styles.name, { color: colors.text }]}>{item.productName}</Text>
      <Text style={[styles.price, { color: colors.muted }]}>{formatCurrency(item.productPrice)}</Text>

      <ProgressBar
        progress={progress}
        color={item.canAfford ? colors.success : colors.primary}
        style={styles.bar}
      />
      <Text style={[styles.percent, { color: colors.muted }]}>{progressLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    elevation: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  price: {
    fontSize: 13,
    marginTop: 2,
  },
  bar: {
    marginTop: 10,
    borderRadius: 4,
    height: 8,
  },
  percent: {
    textAlign: 'right',
    fontSize: 12,
    marginTop: 4,
  },
});
