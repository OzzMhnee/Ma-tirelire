import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Card, Button, Badge, InlineAlert } from '@components/ui';
import { useAuthStore } from '@store/authStore';
import { childrenService } from '@services/children.service';
import { transactionsService } from '@services/transactions.service';
import type { Child } from '@/types/domain.types';
import type { Transaction } from '@/types/domain.types';

export default function ChildDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const [child, setChild] = useState<Child | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const [cRes, tRes] = await Promise.all([
        childrenService.getChildWithBalance(id),
        transactionsService.getTransactions(id),
      ]);
      if (cRes.success && cRes.data) setChild(cRes.data);
      else setError(cRes.error?.message ?? t('common.error'));
      if (tRes.success && tRes.data) setTransactions(tRes.data);
    })();
  }, [id]);

  const handleAddMoney = async (amount: number) => {
    if (!child || !user) return;
    const res = await transactionsService.createTransaction({
      child_id: child.id,
      parent_id: user.id,
      amount,
      type: 'deposit',
      description: t('parent.children.manualDeposit'),
    });
    if (res.success) {
      setChild((prev) => prev ? { ...prev, balance: (prev.balance ?? 0) + amount } : prev);
    } else {
      setError(res.error?.message ?? t('common.error'));
    }
  };

  if (!child) return <View style={styles.center}><Text>{t('common.loading')}</Text></View>;

  return (
    <ScrollView style={styles.container}>
      <InlineAlert message={error} />

      <Card style={styles.balanceCard}>
        <Text variant="headlineSmall" style={styles.name}>{child.name}</Text>
        <Text variant="displaySmall" style={styles.balance}>
          {(child.balance ?? 0).toFixed(2)} €
        </Text>
        <View style={styles.btnRow}>
          <Button label="+1 €"   mode="outlined" onPress={() => handleAddMoney(1)}   style={styles.btn} />
          <Button label="+5 €"   mode="outlined" onPress={() => handleAddMoney(5)}   style={styles.btn} />
          <Button label="+10 €"  mode="outlined" onPress={() => handleAddMoney(10)}  style={styles.btn} />
        </View>
      </Card>

      <Text variant="titleMedium" style={styles.sectionTitle}>
        {t('parent.transactions.recent')}
      </Text>
      {transactions.slice(0, 10).map((tx) => (
        <Card key={tx.id} style={styles.txCard}>
          <View style={styles.row}>
            <View>
              <Text variant="bodyMedium">{tx.description}</Text>
              <Text style={styles.date}>{new Date(tx.created_at).toLocaleDateString('fr-FR')}</Text>
            </View>
            <Badge
              label={`${tx.amount > 0 ? '+' : ''}${tx.amount.toFixed(2)} €`}
              variant={tx.amount > 0 ? 'success' : 'error'}
            />
          </View>
        </Card>
      ))}

      <Button label={t('common.back')} mode="text" onPress={() => router.back()} style={styles.backBtn} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#fafafa' },
  center:       { flex: 1, justifyContent: 'center', alignItems: 'center' },
  balanceCard:  { margin: 16, alignItems: 'center' },
  name:         { fontWeight: '700', marginBottom: 4 },
  balance:      { color: '#4caf50', fontWeight: '700', marginBottom: 12 },
  btnRow:       { flexDirection: 'row', gap: 8 },
  btn:          { flex: 1 },
  sectionTitle: { margin: 16, marginBottom: 4, fontWeight: '600' },
  txCard:       { marginHorizontal: 16 },
  row:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date:         { color: '#999', fontSize: 11 },
  backBtn:      { margin: 16 },
});
