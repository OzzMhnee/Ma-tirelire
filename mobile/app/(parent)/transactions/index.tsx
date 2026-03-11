import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { Card, Badge } from '@components/ui';
import { useAuthStore } from '@store/authStore';
import { useChildrenStore } from '@store/childrenStore';
import { transactionsService } from '@services/transactions.service';
import type { Transaction } from '@/types/domain.types';

export default function ParentTransactionsScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const children = useChildrenStore((s) => s.children);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    if (!children.length) return;
    const results = await Promise.all(
      children.map((c) => transactionsService.getTransactions(c.id))
    );
    const merged = results
      .flatMap((r) => (r.success && r.data ? r.data : []))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setAllTransactions(merged);
  };

  useEffect(() => { load(); }, [children.length]);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text variant="headlineSmall" style={styles.title}>{t('parent.transactions.title')}</Text>
      {allTransactions.length === 0 ? (
        <Card style={styles.mx}><Text style={{ color: '#888' }}>{t('parent.transactions.empty')}</Text></Card>
      ) : (
        allTransactions.map((tx) => (
          <Card key={tx.id} style={styles.mx}>
            <View style={styles.row}>
              <View style={styles.info}>
                <Text variant="bodyMedium">{tx.description}</Text>
                <Text style={styles.date}>
                  {new Date(tx.created_at).toLocaleDateString('fr-FR')}
                </Text>
              </View>
              <Badge
                label={`${tx.amount > 0 ? '+' : ''}${tx.amount.toFixed(2)} €`}
                variant={tx.amount > 0 ? 'success' : 'error'}
              />
            </View>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  title:     { margin: 16, fontWeight: '700' },
  mx:        { marginHorizontal: 16 },
  row:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  info:      { flex: 1 },
  date:      { color: '#999', fontSize: 11, marginTop: 2 },
});
