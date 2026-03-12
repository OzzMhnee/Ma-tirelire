import React from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Text, FAB } from 'react-native-paper';
import { Link, router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Card, Badge } from '@components/ui';
import { useMissions } from '@hooks/useMissions';
import { formatCurrency } from '@utils/format';
import { useParentMissionSections } from '@hooks/useParentMissionSections';
import { useChildrenStore } from '@store/childrenStore';
import type { Mission } from '@/types/domain.types';

const STATUS_VARIANT: Record<Mission['status'], 'warning' | 'success' | 'error' | 'default'> = {
  pending:   'warning',
  completed: 'default',
  validated: 'success',
  rejected:  'error',
};

export default function MissionsListScreen() {
  const { t } = useTranslation();
  const children = useChildrenStore((s) => s.children);
  const { missions, isLoading, refresh } = useMissions();
  const [refreshing, setRefreshing] = React.useState(false);
  const { sections, toggleSection, isExpanded, getDisplayedItems } = useParentMissionSections(missions, children);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const renderMissionGroup = (title: string, items: Mission[], sectionKey: string) => {
    const expanded = isExpanded(sectionKey);
    const displayedItems = getDisplayedItems(sectionKey, items);

    return (
      <View key={sectionKey} style={styles.groupBlock}>
        <Text style={styles.groupTitle}>{title}</Text>
        {items.length === 0 ? (
          <Text style={styles.groupEmpty}>{t('parent.missions.empty')}</Text>
        ) : (
          displayedItems.map((mission) => {
            const content = (
              <Card style={styles.mx}>
                <View style={styles.row}>
                  <View style={styles.info}>
                    <Text variant="bodyMedium">{mission.title}</Text>
                    <Text style={styles.reward}>{formatCurrency(mission.reward)}</Text>
                  </View>
                  <Badge
                    label={t(`mission.status.${mission.status}`)}
                    variant={STATUS_VARIANT[mission.status]}
                  />
                </View>
              </Card>
            );

            return (
              <Link key={mission.id} href={`/(parent)/missions/${mission.id}/validate`} asChild>
                {content}
              </Link>
            );
          })
        )}
        {items.length > 2 ? (
          <Text style={styles.showMore} onPress={() => toggleSection(sectionKey)}>
            {expanded ? t('parent.common.showLess') : t('parent.common.showMore')}
          </Text>
        ) : null}
      </View>
    );
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
          sections.map((section) => (
              <View key={section.childId} style={styles.childSection}>
                <Text style={styles.childTitle}>
                  {t('parent.missions.forChild', { name: section.childName })}
                </Text>
                {renderMissionGroup(t('parent.missions.pendingGroup'), section.pending, `${section.childId}-pending`)}
                {renderMissionGroup(t('parent.missions.completedGroup'), section.completed, `${section.childId}-completed`)}
              </View>
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
  childSection: { marginBottom: 8 },
  childTitle: { marginHorizontal: 16, marginBottom: 8, color: '#374151', fontWeight: '700' },
  groupBlock: { marginBottom: 12 },
  groupTitle: { marginHorizontal: 16, marginBottom: 6, color: '#6b7280', fontWeight: '600' },
  groupEmpty: { marginHorizontal: 16, color: '#9ca3af', marginBottom: 4 },
  mx:    { marginHorizontal: 16 },
  row:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  info:  { flex: 1 },
  reward:{ color: '#4caf50', fontSize: 12 },
  showMore: { marginHorizontal: 16, color: '#512da8', fontWeight: '600' },
  fab:   { position: 'absolute', right: 16, bottom: 24, backgroundColor: '#512da8' },
});
