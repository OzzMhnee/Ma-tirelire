import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Card, Badge, Button, InlineAlert } from '@components/ui';
import { useMissions } from '@hooks/useMissions';
import { useMissionsStore } from '@store/missionsStore';
import { useAuthStore } from '@store/authStore';

export default function ValidateMissionScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const { validate, isLoading } = useMissions(mission?.child_id);
  const mission = useMissionsStore((s) => s.missions.find((m) => m.id === id));
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleValidate = async () => {
    if (!mission) return;
    setError(null);
    const res = await validate(mission.id);
    if (res.success) setDone(true);
    else setError(res.error?.message ?? t('common.error'));
  };

  if (!mission) {
    return <View style={styles.center}><Text>{t('common.loading')}</Text></View>;
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
        <Text variant="titleSmall">{mission.title}</Text>
        {mission.description ? (
          <Text style={styles.desc}>{mission.description}</Text>
        ) : null}
        <View style={styles.row}>
          <Badge label={t(`mission.status.${mission.status}`)} variant="warning" />
          <Text style={styles.reward}>{mission.reward_amount.toFixed(2)} €</Text>
        </View>
      </Card>

      <Button
        label={t('parent.missions.validateBtn')}
        onPress={handleValidate}
        loading={isLoading}
        style={styles.btn}
      />
      <Button
        label={t('common.cancel')}
        mode="text"
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
