import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Card, Badge, Button } from '@components/ui';
import { useAuthActions } from '@hooks/useAuthActions';
import { useAuthStore } from '@store/authStore';
import { useChildrenStore } from '@store/childrenStore';
import { useMissionsStore } from '@store/missionsStore';
import { childrenService } from '@services/children.service';
import { missionsService } from '@services/missions.service';

export default function ParentDashboard() {
  const { t } = useTranslation();
  const { signOut } = useAuthActions();
  const user = useAuthStore((s) => s.user);
  const { children, setChildren } = useChildrenStore();
  const { missions, setMissions } = useMissionsStore();
  const [refreshing, setRefreshing] = React.useState(false);

  const load = async () => {
    if (!user) return;
    const [cRes, mRes] = await Promise.all([
      childrenService.getChildren(user.id),
      missionsService.getMissions(user.id),
    ]);
    if (cRes.success && cRes.data) setChildren(cRes.data);
    if (mRes.success && mRes.data) setMissions(mRes.data);
  };

  useEffect(() => { load(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const pendingMissions = missions.filter((m) => m.status === 'pending');

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.greeting}>
          {t('parent.dashboard.greeting', { name: user?.username })}
        </Text>
        <Button label={t('common.logout')} mode="text" onPress={signOut} />
      </View>

      {/* Résumé enfants */}
      <Text variant="titleMedium" style={styles.sectionTitle}>
        {t('parent.dashboard.children')}
      </Text>
      {children.length === 0 ? (
        <Card>
          <Text style={styles.emptyText}>{t('parent.children.empty')}</Text>
          <Link href="/(parent)/children/new" style={styles.link}>
            {t('parent.children.add')}
          </Link>
        </Card>
      ) : (
        children.map((child) => (
          <Link key={child.id} href={`/(parent)/children/${child.id}`} asChild>
            <Card style={styles.childCard}>
              <View style={styles.row}>
                <Text variant="titleSmall">{child.name}</Text>
                <Text variant="bodyMedium" style={styles.balance}>
                  {(child.balance ?? 0).toFixed(2)} €
                </Text>
              </View>
            </Card>
          </Link>
        ))
      )}

      {/* Missions en attente */}
      {pendingMissions.length > 0 && (
        <>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t('parent.dashboard.pendingMissions', { count: pendingMissions.length })}
          </Text>
          {pendingMissions.slice(0, 3).map((m) => (
            <Link key={m.id} href={`/(parent)/missions/${m.id}/validate`} asChild>
              <Card style={styles.missionCard}>
                <View style={styles.row}>
                  <Text variant="bodyMedium">{m.title}</Text>
                  <Badge label={t('mission.status.pending')} variant="warning" />
                </View>
              </Card>
            </Link>
          ))}
        </>
      )}

      <View style={styles.actionsRow}>
        <Link href="/(parent)/children/new" asChild>
          <Button label={t('parent.children.add')} mode="outlined" style={styles.actionBtn} />
        </Link>
        <Link href="/(parent)/missions/new" asChild>
          <Button label={t('parent.missions.add')} mode="outlined" style={styles.actionBtn} />
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#fafafa' },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 48 },
  greeting:     { fontWeight: '700' },
  sectionTitle: { margin: 16, marginBottom: 4, fontWeight: '600' },
  childCard:    { marginHorizontal: 16 },
  missionCard:  { marginHorizontal: 16 },
  row:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balance:      { color: '#4caf50', fontWeight: '600' },
  emptyText:    { color: '#888', marginBottom: 8 },
  link:         { color: '#512da8' },
  actionsRow:   { flexDirection: 'row', padding: 16, gap: 8 },
  actionBtn:    { flex: 1 },
});
