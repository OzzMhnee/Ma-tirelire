import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Card, Badge, Button, DestructiveActionCard, InlineAlert } from '@components/ui';
import { useMissions } from '@hooks/useMissions';
import { formatCurrency } from '@utils/format';
import { useMissionsStore } from '@store/missionsStore';
import { useAuthStore } from '@store/authStore';

export default function ValidateMissionScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const mission = useMissionsStore((s) => s.missions.find((m) => m.id === id));
  const { validate, deleteMission, isLoading } = useMissions(mission?.childId);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const handleValidate = async () => {
    if (!mission) return;
    setError(null);
    const res = await validate(mission.id);
    if (res && !res.error) setDone(true);
    else setError(res?.error?.message ?? t('common.error'));
  };

  const handleDelete = async () => {
    if (!mission) return;
    setError(null);
    const res = await deleteMission(mission.id);
    if (res && !res.error) setDeleted(true);
    else setError(res?.error?.message ?? t('common.error'));
  };

  if (!mission && !deleted) {
    return <View style={styles.center}><Text>{t('common.loading')}</Text></View>;
  }

  if (deleted) {
    return (
      <View style={styles.center}>
        <Text variant="headlineSmall" style={{ color: '#e53935', marginBottom: 16 }}>
          {t('parent.missions.deleted')}
        </Text>
        <Button label={t('common.back')} onPress={() => router.back()} />
      </View>
    );
  }

  if (done) {
    return (
      <View style={styles.center}>
        <Text variant="headlineSmall" style={{ color: '#4caf50', marginBottom: 16 }}>
          {t('parent.missions.validated')}
        </Text>
        <Button label={t('common.back')} onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>{t('parent.missions.validateTitle')}</Text>
      <InlineAlert message={error} />

      <Card>
        <Text variant="titleSmall">{mission!.title}</Text>
        {mission!.description ? (
          <Text style={styles.desc}>{mission!.description}</Text>
        ) : null}
        <View style={styles.row}>
          <Badge label={t(`mission.status.${mission!.status}`)} variant="warning" />
          <Text style={styles.reward}>{formatCurrency(mission!.reward)}</Text>
        </View>
      </Card>

      {mission!.status === 'completed' && (
        <Button
          label={t('parent.missions.validateBtn')}
          onPress={handleValidate}
          loading={isLoading}
          style={styles.btn}
        />
      )}

      <DestructiveActionCard
        title={t('parent.missions.deleteBtn')}
        description=""
        actionLabel={t('parent.missions.deleteBtn')}
        confirmMessage={t('parent.missions.deleteConfirm')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        onConfirm={handleDelete}
        loading={isLoading}
        style={styles.btn}
      />

      <Button
        label={t('common.back')}
        variant="ghost"
        onPress={() => router.back()}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 48 },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title:     { fontWeight: '700', marginBottom: 16 },
  desc:      { color: '#666', marginTop: 4, marginBottom: 8 },
  row:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  reward:    { color: '#4caf50', fontWeight: '700' },
  btn:       { marginTop: 16 },
});
