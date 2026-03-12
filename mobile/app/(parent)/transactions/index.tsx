import React from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Text } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Card, Badge } from '@components/ui';
import { useParentTransactions } from '@hooks/useParentTransactions';
import { formatSignedCurrency, formatDate } from '@utils/format';

export default function ParentTransactionsScreen() {
  const { t } = useTranslation();
  const { childId } = useLocalSearchParams<{ childId?: string }>();
  const { groups, isEmpty, refreshing, refresh, toggle, isExpanded, getDisplayedItems } = useParentTransactions(childId);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
    >
      <Text variant="headlineSmall" style={styles.title}>{t('parent.transactions.title')}</Text>
      {isEmpty ? (
        <Card style={styles.mx}><Text style={{ color: '#888' }}>{t('parent.transactions.empty')}</Text></Card>
      ) : (
        groups.map((group) => {
          const displayed = getDisplayedItems(group.childId, group.items);

          return (
            <View key={group.childId} style={styles.childSection}>
              <Text style={styles.childTitle}>
                {t('parent.transactions.forChild', { name: group.childName })}
              </Text>
              {displayed.map((tx) => (
                <Card key={tx.id} style={styles.mx}>
                  <View style={styles.row}>
                    <View style={styles.info}>
                      <Text variant="bodyMedium">{tx.description}</Text>
                      <Text style={styles.date}>
                        {formatDate(tx.createdAt)}
                      </Text>
                    </View>
                    <Badge
                      label={formatSignedCurrency(tx.amount)}
                      variant={tx.amount > 0 ? 'success' : 'error'}
                    />
                  </View>
                </Card>
              ))}
              {group.items.length > 2 ? (
                <Text style={styles.showMore} onPress={() => toggle(group.childId)}>
                  {isExpanded(group.childId) ? t('parent.common.showLess') : t('parent.common.showMore')}
                </Text>
              ) : null}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  title:     { margin: 16, fontWeight: '700' },
  childSection: { marginBottom: 8 },
  childTitle: { marginHorizontal: 16, marginBottom: 8, color: '#374151', fontWeight: '700' },
  mx:        { marginHorizontal: 16 },
  row:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  info:      { flex: 1 },
  date:      { color: '#999', fontSize: 11, marginTop: 2 },
  showMore:  { marginHorizontal: 16, color: '#512da8', fontWeight: '600' },
});
