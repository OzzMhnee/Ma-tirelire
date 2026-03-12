import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Text, FAB } from 'react-native-paper';
import { Link, router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Card, Button } from '@components/ui';
import { useChildrenList } from '@hooks/useChildrenList';
import { formatCurrency } from '@utils/format';

export default function ChildrenListScreen() {
  const { t } = useTranslation();
  const { children, refreshing, refresh } = useChildrenList();

  useEffect(() => {
    if (children.length === 1) {
      router.replace(`/(parent)/children/${children[0].id}`);
    }
  }, [children, router]);

  return (
    <View style={styles.flex}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      >
        <Text variant="headlineSmall" style={styles.title}>{t('parent.children.title')}</Text>
        {children.length === 0 ? (
          <Card style={styles.empty}>
            <Text style={{ color: '#888' }}>{t('parent.children.empty')}</Text>
          </Card>
        ) : (
          children.map((child) => (
            <Link key={child.id} href={`/(parent)/children/${child.id}`} asChild>
              <Card style={styles.card}>
                <View style={styles.row}>
                  <View>
                    <Text variant="titleSmall">{child.pseudonym}</Text>
                    <Text style={styles.age}>
                      {child.birthYear ? t('parent.children.birthYearValue', { year: child.birthYear }) : ''}
                    </Text>
                  </View>
                  <Text style={styles.balance}>{formatCurrency(child.balance ?? 0)}</Text>
                </View>
              </Card>
            </Link>
          ))
        )}
      </ScrollView>
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/(parent)/children/new')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex:    { flex: 1, backgroundColor: '#fafafa' },
  title:   { margin: 16, fontWeight: '700' },
  card:    { marginHorizontal: 16 },
  empty:   { marginHorizontal: 16 },
  row:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  age:     { color: '#888', fontSize: 12 },
  balance: { color: '#4caf50', fontWeight: '700', fontSize: 16 },
  fab:     { position: 'absolute', right: 16, bottom: 24, backgroundColor: '#512da8' },
});
