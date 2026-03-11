import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Text, FAB } from 'react-native-paper';
import { Link, router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Card, Badge } from '@components/ui';
import { useMissions } from '@hooks/useMissions';
import { useAuthStore } from '@store/authStore';
import type { Mission } from '@/types/domain.types';

const STATUS_VARIANT: Record<Mission['status'], 'warning' | 'success' | 'error' | 'default'> = {
  pending:   'warning',
  validated: 'success',
  refused:   'error',
  todo:      'default',
};

export default function MissionsListScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { missions, isLoading, loadMissions } = useMissions();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => { if (user) loadMissions(user.id); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    if (user) await loadMissions(user.id);
    setRefreshing(false);
  };

  return (
    <View style={styles.flex}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing || isLoading} onRefresh={onRefresh} />}
      >
        <Text variant="headlineSmall" style={styles.title}>{t('parent.missions.title')}</Text>
        {missions.length === 0 && !isLoading ? (
          <Card style={styles.mx}><Text style={{ color: '#888' }}>{t('parent.missions.empty')}</Text></Card>
        ) : (
          missions.map((mission) => (
            <Link
              key={mission.id}
              href={mission.status === 'pending'
                ? `/(parent)/missions/${mission.id}/validate`
                : `/(parent)/missions/${mission.id}`}
              asChild
            >
              <Card style={styles.mx}>
                <View style={styles.row}>
                  <View style={styles.info}>
                    <Text variant="bodyMedium">{mission.title}</Text>
                    <Text style={styles.reward}>{mission.reward_amount.toFixed(2)} €</Text>
                  </View>
                  <Badge
                    label={t(`mission.status.${mission.status}`)}
                    variant={STATUS_VARIANT[mission.status]}
                  />
                </View>
              </Card>
            </Link>
          ))
        )}
      </ScrollView>
      <FAB icon="plus" style={styles.fab} onPress={() => router.push('/(parent)/missions/new')} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex:  { flex: 1, backgroundColor: '#fafafa' },
  title: { margin: 16, fontWeight: '700' },
  mx:    { marginHorizontal: 16 },
  row:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  info:  { flex: 1 },
  reward:{ color: '#4caf50', fontSize: 12 },
  fab:   { position: 'absolute', right: 16, bottom: 24, backgroundColor: '#512da8' },
});
