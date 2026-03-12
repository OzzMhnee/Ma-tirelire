import React from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Text } from 'react-native-paper';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { router } from 'expo-router';

import { Card, Badge, Button, InlineAlert } from '@components/ui';
import { useAuthActions } from '@hooks/useAuthActions';
import { useParentDashboard } from '@hooks/useParentDashboard';
import { formatCurrency } from '@utils/format';

export default function ParentDashboard() {
  const { t } = useTranslation();
  const { signOut } = useAuthActions();
  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };
  const { user, children, pendingMissions, refreshing, error, refresh, openMissionCreation } = useParentDashboard();

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
    >
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.greeting}>
          {t('parent.dashboard.greeting', { name: user?.username })}
        </Text>
        <Button label={t('common.logout')} mode="text" onPress={handleSignOut} />
      </View>

      <View style={styles.alertWrap}>
        <InlineAlert message={error} />
      </View>

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
          <View key={child.id} style={styles.childRow}>
            <Link href={`/(parent)/children/${child.id}`} asChild>
              <Card style={StyleSheet.flatten([styles.childCard, styles.childCardMain])}>
                <View style={styles.row}>
                  <Text variant="titleSmall">{child.pseudonym}</Text>
                  <Text variant="bodyMedium" style={styles.balance}>
                    {formatCurrency(child.balance ?? 0)}
                  </Text>
                </View>
              </Card>
            </Link>
            <Link href={`/(parent)/children/${child.id}/edit`} asChild>
              <Button label="✎" variant="outline" style={styles.editButton} />
            </Link>
          </View>
        ))
      )}

      {children.length > 0 && (
        <View style={styles.actionsRow}>
          <Link href="/(parent)/children/new" asChild>
            <Button label={t('parent.children.add')} mode="outlined" style={styles.actionBtn} />
          </Link>
          <Button
            label={t('parent.missions.add')}
            mode="outlined"
            style={styles.actionBtn}
            onPress={openMissionCreation}
          />
        </View>
      )}

      {pendingMissions.length > 0 && (
        <>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t('parent.dashboard.pendingMissions', { count: pendingMissions.length })}
          </Text>
          {pendingMissions.slice(0, 3).map((m) => (
            <Link key={m.id} href={`/(parent)/missions/${m.id}/validate`} asChild>
              <Card style={styles.missionCard}>
                <View style={styles.row}>
                  <Text variant="bodyMedium" style={styles.missionTitle}>{m.title}</Text>
                  <Text style={styles.missionReward}>{formatCurrency(m.reward)}</Text>
                  <Badge label={t('mission.status.pending')} variant="warning" />
                </View>
              </Card>
            </Link>
          ))}
        </>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#fafafa' },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 48 },
  greeting:     { fontWeight: '700' },
  alertWrap:    { paddingHorizontal: 16 },
  sectionTitle: { margin: 16, marginBottom: 4, fontWeight: '600' },
  childRow:     { flexDirection: 'row', alignItems: 'stretch', marginHorizontal: 16, gap: 8 },
  childCard:    { marginHorizontal: 0 },
  childCardMain:{ flex: 1 },
  editButton:   { width: 56, justifyContent: 'center' },
  missionCard:  { marginHorizontal: 16 },
  missionTitle: { flex: 1 },
  missionReward:{ color: '#4caf50', fontWeight: '600', marginHorizontal: 8 },
  row:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balance:      { color: '#4caf50', fontWeight: '600' },
  emptyText:    { color: '#888', marginBottom: 8 },
  link:         { color: '#512da8' },
  actionsRow:   { flexDirection: 'row', padding: 16, gap: 8 },
  actionBtn:    { flex: 1 },
});
