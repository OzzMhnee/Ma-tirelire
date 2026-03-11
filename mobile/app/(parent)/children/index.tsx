import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Text, FAB } from 'react-native-paper';
import { Link, router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Card, Button } from '@components/ui';
import { useAuthStore } from '@store/authStore';
import { useChildrenStore } from '@store/childrenStore';
import { childrenService } from '@services/children.service';

export default function ChildrenListScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { children, setChildren } = useChildrenStore();
  const [refreshing, setRefreshing] = React.useState(false);

  const load = async () => {
    if (!user) return;
    const res = await childrenService.getChildren(user.id);
    if (res.success && res.data) setChildren(res.data);
  };

  useEffect(() => { load(); }, []);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  return (
    <View style={styles.flex}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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
                    <Text variant="titleSmall">{child.name}</Text>
                    <Text style={styles.age}>
                      {child.age ? t('parent.children.age', { age: child.age }) : ''}
                    </Text>
                  </View>
                  <Text style={styles.balance}>{(child.balance ?? 0).toFixed(2)} €</Text>
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
