import React from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Text, ProgressBar } from 'react-native-paper';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Card, Badge } from '@components/ui';
import { useChildDashboard } from '@hooks/useChildDashboard';
import { formatCurrency } from '@utils/format';

export default function ChildDashboard() {
  const { t } = useTranslation();
  const { activeChild, balance, todoMissions, topWish, isLoading, refresh } = useChildDashboard();

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} />}
    >
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.greeting}>
          {t('child.dashboard.greeting', { name: activeChild?.pseudonym })}
        </Text>
      </View>

      {/* Tirelire */}
      <Card style={styles.balanceCard}>
        <Text variant="bodyMedium" style={styles.balanceLabel}>{t('child.dashboard.balance')}</Text>
        <Text variant="displaySmall" style={styles.balance}>{formatCurrency(balance)}</Text>
      </Card>

      {/* Wishlist top */}
      {topWish && (
        <Card style={styles.wishCard}>
          <Text variant="titleSmall" style={styles.sectionLabel}>{t('child.dashboard.topWish')}</Text>
          <Text variant="bodyMedium">{topWish.productName}</Text>
          <Text style={styles.wishPrice}>{formatCurrency(topWish.productPrice)}</Text>
          <ProgressBar
            progress={(topWish.progressPercent ?? 0) / 100}
            color="#512da8"
            style={styles.progress}
          />
          <Text style={styles.progressText}>
            {Math.round(topWish.progressPercent ?? 0)} %
          </Text>
        </Card>
      )}

      {/* Missions */}
      <Text variant="titleMedium" style={styles.sectionTitle}>{t('child.dashboard.missions')}</Text>
      {todoMissions.length === 0 ? (
        <Card style={styles.mx}><Text style={{ color: '#888' }}>{t('child.missions.empty')}</Text></Card>
      ) : (
        todoMissions.map((m) => (
          <Card key={m.id} style={styles.mx}>
            <View style={styles.row}>
              <Text variant="bodyMedium">{m.title}</Text>
              <Badge
                label={formatCurrency(m.reward)}
                variant={m.status === 'pending' ? 'warning' : 'info'}
              />
            </View>
          </Card>
        ))
      )}

      <Link href="/(child)/wishlist/index" style={styles.wishLink}>
        {t('child.dashboard.seeWishlist')}
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f3f0ff' },
  header:       { padding: 16, paddingTop: 48 },
  greeting:     { fontWeight: '700', color: '#512da8' },
  balanceCard:  { margin: 16, alignItems: 'center' },
  balanceLabel: { color: '#666' },
  balance:      { color: '#4caf50', fontWeight: '700' },
  wishCard:     { marginHorizontal: 16 },
  sectionLabel: { color: '#512da8', marginBottom: 4 },
  wishPrice:    { color: '#888', fontSize: 12 },
  progress:     { marginTop: 8, borderRadius: 4, height: 8 },
  progressText: { textAlign: 'right', fontSize: 11, color: '#888', marginTop: 2 },
  sectionTitle: { margin: 16, marginBottom: 4, fontWeight: '600' },
  mx:           { marginHorizontal: 16 },
  row:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  wishLink:     { textAlign: 'center', color: '#512da8', margin: 20, fontWeight: '600' },
});
