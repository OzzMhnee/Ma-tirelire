import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Text, ProgressBar } from 'react-native-paper';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Card, Badge } from '@components/ui';
import { useAuthStore } from '@store/authStore';
import { useMissions } from '@hooks/useMissions';
import { useChildBalance } from '@hooks/useTransactions';
import { wishlistService } from '@services/wishlist.service';
import type { WishlistItem } from '@/types/domain.types';

export default function ChildDashboard() {
  const { t } = useTranslation();
  const activeChild = useAuthStore((s) => s.activeChild);
  const { balance, refresh: refreshBalance } = useChildBalance(activeChild?.id ?? '');
  const { missions, isLoading, refresh: refreshMissions } = useMissions(activeChild?.id);
  const [wishlist, setWishlist] = React.useState<WishlistItem[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);

  const load = async () => {
    if (!activeChild) return;
    await Promise.all([
      refreshBalance(),
      refreshMissions(),
    ]);
    const wRes = await wishlistService.getWishlist(activeChild.id);
    if (wRes.success && wRes.data) setWishlist(wRes.data);
  };

  useEffect(() => { load(); }, [activeChild?.id]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const todoMissions = missions.filter((m) => m.status === 'todo' || m.status === 'pending');

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing || isLoading} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.greeting}>
          {t('child.dashboard.greeting', { name: activeChild?.name })}
        </Text>
      </View>

      {/* Tirelire */}
      <Card style={styles.balanceCard}>
        <Text variant="bodyMedium" style={styles.balanceLabel}>{t('child.dashboard.balance')}</Text>
        <Text variant="displaySmall" style={styles.balance}>{balance.toFixed(2)} €</Text>
      </Card>

      {/* Wishlist top */}
      {wishlist.length > 0 && (
        <Card style={styles.wishCard}>
          <Text variant="titleSmall" style={styles.sectionLabel}>{t('child.dashboard.topWish')}</Text>
          <Text variant="bodyMedium">{wishlist[0].name}</Text>
          <Text style={styles.wishPrice}>{wishlist[0].target_amount.toFixed(2)} €</Text>
          <ProgressBar
            progress={(wishlist[0].progressPercent ?? 0) / 100}
            color="#512da8"
            style={styles.progress}
          />
          <Text style={styles.progressText}>
            {Math.round(wishlist[0].progressPercent ?? 0)} %
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
                label={`${m.reward_amount.toFixed(2)} €`}
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
