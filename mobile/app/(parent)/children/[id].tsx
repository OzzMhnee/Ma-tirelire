import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Card, Button, Badge, InlineAlert, Input } from '@components/ui';
import { useChildDetails } from '@hooks/useChildDetails';
import { useAuthStore } from '@store/authStore';
import { formatCurrency, formatSignedCurrency, formatDate } from '@utils/format';

export default function ChildDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const [depositAmount, setDepositAmount] = React.useState('');
  const {
    child,
    recentTransactions,
    wishlist,
    error,
    pendingMissions,
    waitingValidationMissions,
    unlockedBadges,
    addMoney,
  } = useChildDetails({
    childId: id,
    parentId: user?.id,
    manualDepositLabel: t('parent.children.manualDeposit', { name: user?.username }),
    defaultErrorMessage: t('common.error'),
  });

  if (!child) return <View style={styles.center}><Text>{t('common.loading')}</Text></View>;

  return (
    <ScrollView style={styles.container}>
      <InlineAlert message={error} />

      <Card style={styles.balanceCard}>
        <Text variant="headlineSmall" style={styles.name}>{child.pseudonym}</Text>
        <Text variant="displaySmall" style={styles.balance}>
          {formatCurrency(child.balance ?? 0)}
        </Text>
        <Text style={styles.metaText}>{t('parent.children.levelValue', { level: child.level, xp: child.experience })}</Text>
        <View style={styles.depositRow}>
          <Input
            label={t('parent.children.depositAmount')}
            value={depositAmount}
            onChangeText={setDepositAmount}
            keyboardType="decimal-pad"
            style={styles.depositInput}
          />
          <Button
            label={t('parent.children.depositButton')}
            mode="outlined"
            onPress={() => {
              const parsed = Number(depositAmount.replace(',', '.'));
              if (!isNaN(parsed) && parsed > 0) {
                addMoney(Math.round(parsed * 100) / 100);
                setDepositAmount('');
              }
            }}
            style={styles.depositBtn}
          />
        </View>
        <Button
          label={t('parent.missions.addForChild')}
          mode="outlined"
          onPress={() => router.push({ pathname: '/(parent)/missions/new', params: { childId: child.id, lockChild: 'true' } })}
          style={styles.childMissionButton}
        />
      </Card>

      <Text variant="titleMedium" style={styles.sectionTitle}>{t('parent.children.badges')}</Text>
      <Card style={styles.sectionCard}>
        {unlockedBadges.length === 0 ? (
          <Text style={styles.emptyLabel}>{t('parent.children.noBadges')}</Text>
        ) : (
          <View style={styles.badgeWrap}>
            {unlockedBadges.map((badge) => (
              <Badge key={badge.id} label={badge.itemId} variant="success" />
            ))}
          </View>
        )}
      </Card>

      <Text variant="titleMedium" style={styles.sectionTitle}>{t('parent.children.todoMissions')}</Text>
      <Card style={styles.sectionCard}>
        {pendingMissions.length === 0 ? (
          <Text style={styles.emptyLabel}>{t('parent.missions.empty')}</Text>
        ) : (
          pendingMissions.map((mission) => (
            <View key={mission.id} style={styles.listRow}>
              <Text variant="bodyMedium">{mission.title}</Text>
              <Badge label={formatCurrency(mission.reward)} variant="warning" />
            </View>
          ))
        )}
      </Card>

      <Text variant="titleMedium" style={styles.sectionTitle}>{t('parent.children.doneMissions')}</Text>
      <Card style={styles.sectionCard}>
        {waitingValidationMissions.length === 0 ? (
          <Text style={styles.emptyLabel}>{t('parent.children.noCompletedMissions')}</Text>
        ) : (
          waitingValidationMissions.map((mission) => (
            <View key={mission.id} style={styles.listRow}>
              <Text variant="bodyMedium">{mission.title}</Text>
              <Button
                label={t('parent.missions.validateBtn')}
                size="sm"
                onPress={() => router.push(`/(parent)/missions/${mission.id}/validate`)}
              />
            </View>
          ))
        )}
      </Card>

      <Text variant="titleMedium" style={styles.sectionTitle}>{t('parent.children.wishlist')}</Text>
      <Card style={styles.sectionCard}>
        {wishlist.length === 0 ? (
          <Text style={styles.emptyLabel}>{t('child.wishlist.empty')}</Text>
        ) : (
          wishlist.map((item) => (
            <View key={item.id} style={styles.wishlistItem}>
              <View style={styles.row}>
                <Text variant="bodyMedium">{item.productName}</Text>
                <Text style={styles.progressValue}>{formatCurrency(item.productPrice)}</Text>
              </View>
              <Text style={styles.progressHint}>
                {t('parent.children.progressValue', {
                  current: formatCurrency(item.currentBalance ?? 0),
                  target: formatCurrency(item.productPrice),
                  percent: Math.round(item.progressPercent ?? 0),
                })}
              </Text>
            </View>
          ))
        )}
      </Card>

      <Text variant="titleMedium" style={styles.sectionTitle}>
        {t('parent.transactions.recent')}
      </Text>
      {recentTransactions.map((tx) => (
        <Card key={tx.id} style={styles.txCard}>
          <View style={styles.row}>
            <View>
              <Text variant="bodyMedium">{tx.description}</Text>
              <Text style={styles.date}>{formatDate(tx.createdAt)}</Text>
            </View>
            <Badge
              label={formatSignedCurrency(tx.amount)}
              variant={tx.amount > 0 ? 'success' : 'error'}
            />
          </View>
        </Card>
      ))}

      <Button
        label={t('parent.children.historyButton')}
        mode="outlined"
        onPress={() => router.push({ pathname: '/(parent)/transactions', params: { childId: child.id } })}
        style={styles.backBtn}
      />
      <Button label={t('common.back')} mode="text" onPress={() => router.back()} style={styles.backBtn} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#fafafa' },
  center:       { flex: 1, justifyContent: 'center', alignItems: 'center' },
  balanceCard:  { margin: 16, alignItems: 'center' },
  name:         { fontWeight: '700', marginBottom: 4 },
  balance:      { color: '#4caf50', fontWeight: '700', marginBottom: 12 },
  metaText:     { color: '#6b7280', marginBottom: 12 },
  depositRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  depositInput: { flex: 1 },
  depositBtn:   { flexShrink: 0 },
  sectionTitle: { margin: 16, marginBottom: 4, fontWeight: '600' },
  sectionCard:  { marginHorizontal: 16 },
  txCard:       { marginHorizontal: 16 },
  row:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  wishlistItem: { marginBottom: 12 },
  badgeWrap:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emptyLabel:   { color: '#888' },
  progressHint: { color: '#6b7280', fontSize: 12, marginTop: 4 },
  progressValue:{ color: '#4b5563', fontWeight: '600' },
  date:         { color: '#999', fontSize: 11 },
  childMissionButton: { marginTop: 12, width: '100%' },
  backBtn:      { margin: 16 },
});
