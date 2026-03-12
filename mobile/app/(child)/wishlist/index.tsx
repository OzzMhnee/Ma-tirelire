import React from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Text, FAB, ProgressBar } from 'react-native-paper';
import { Link, router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Card, Badge } from '@components/ui';
import { useWishlist } from '@hooks/useWishlist';
import { formatCurrency } from '@utils/format';

export default function WishlistScreen() {
  const { t } = useTranslation();
  const { items, refreshing, refresh } = useWishlist();

  return (
    <View style={styles.flex}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      >
        <Text variant="headlineSmall" style={styles.title}>{t('child.wishlist.title')}</Text>
        {items.length === 0 ? (
          <Card style={styles.mx}><Text style={{ color: '#888' }}>{t('child.wishlist.empty')}</Text></Card>
        ) : (
          items.map((item) => (
            <Card key={item.id} style={styles.mx}>
              <View style={styles.row}>
                <View style={styles.info}>
                  <Text variant="bodyMedium">{item.productName}</Text>
                  <Text style={styles.price}>{formatCurrency(item.productPrice)}</Text>
                </View>
                {item.canAfford && (
                  <Badge label={t('child.wishlist.canAfford')} variant="success" />
                )}
              </View>
              <ProgressBar
                progress={(item.progressPercent ?? 0) / 100}
                color="#512da8"
                style={styles.progress}
              />
              <Text style={styles.progressText}>
                {Math.round(item.progressPercent ?? 0)} %
              </Text>
            </Card>
          ))
        )}
      </ScrollView>
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/(child)/wishlist/new')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex:         { flex: 1, backgroundColor: '#f3f0ff' },
  title:        { margin: 16, fontWeight: '700', color: '#512da8' },
  mx:           { marginHorizontal: 16 },
  row:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  info:         { flex: 1 },
  price:        { color: '#888', fontSize: 12 },
  progress:     { marginTop: 8, borderRadius: 4, height: 8 },
  progressText: { textAlign: 'right', fontSize: 11, color: '#888', marginTop: 2 },
  fab:          { position: 'absolute', right: 16, bottom: 24, backgroundColor: '#512da8' },
});
