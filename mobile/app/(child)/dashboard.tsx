import React from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Text, ProgressBar } from 'react-native-paper';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Card } from '@components/ui';
import { BalanceCard, MissionCard, WishProgressCard, TransactionRow } from '@components/child';
import { useChildDashboard } from '@hooks/useChildDashboard';
import { useAppTheme } from '@/theme/ThemeProvider';

export default function ChildDashboard() {
  const { t } = useTranslation();
  const { theme: { colors } } = useAppTheme();
  const {
    activeChild,
    balance,
    todoMissions,
    completedMissions,
    topWish,
    recentTransactions,
    level,
    experience,
    xpNext,
    xpProgress,
    completeMission,
    isLoading,
    refresh,
  } = useChildDashboard();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} />}
    >
      {/* ─── En-tête : Greeting + Niveau ─── */}
      <View style={styles.header}>
        <Text variant="headlineMedium" style={[styles.greeting, { color: colors.primary }]}>
          {t('child.dashboard.greeting', { name: activeChild?.pseudonym })}
        </Text>
        {activeChild?.parentNickname ? (
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            {t('child.dashboard.parentNickname', { name: activeChild.parentNickname })}
          </Text>
        ) : null}
      </View>

      {/* ─── Niveau & XP ─── */}
      <Card style={styles.section}>
        <View style={styles.levelRow}>
          <Text style={[styles.levelText, { color: colors.primary }]}>
            {t('child.dashboard.levelXp', { level })}
          </Text>
          <Text style={[styles.xpText, { color: colors.muted }]}>
            {t('child.dashboard.xpProgress', { current: experience, next: xpNext })}
          </Text>
        </View>
        <ProgressBar progress={xpProgress} color={colors.primary} style={styles.xpBar} />
      </Card>

      {/* ─── Tirelire ─── */}
      <BalanceCard balance={balance} label={t('child.dashboard.balance')} />

      {/* ─── Souhait principal ─── */}
      {topWish ? (
        <View style={styles.section}>
          <WishProgressCard
            item={topWish}
            label={t('child.dashboard.topWish')}
            progressLabel={t('child.dashboard.wishProgress', {
              percent: Math.round(topWish.progressPercent ?? 0),
            })}
          />
          <Link href="/(child)/wishlist/index" style={[styles.link, { color: colors.primary }]}>
            {t('child.dashboard.seeWishlist')}
          </Link>
        </View>
      ) : (
        <Card>
          <Link href="/(child)/wishlist/new" style={[styles.link, { color: colors.primary }]}>
            {t('child.dashboard.seeWishlist')}
          </Link>
        </Card>
      )}

      {/* ─── Missions à faire ─── */}
      <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.text }]}>
        {t('child.dashboard.missions')}
        {todoMissions.length > 0 ? (
          <Text style={[styles.countBadge, { color: colors.muted }]}>
            {'  '}{t('child.dashboard.missionsToDoCount', { count: todoMissions.length })}
          </Text>
        ) : null}
      </Text>

      {todoMissions.length === 0 && completedMissions.length === 0 ? (
        <Card>
          <Text style={{ color: colors.muted, textAlign: 'center' }}>
            {t('child.dashboard.noMissions')}
          </Text>
        </Card>
      ) : (
        <>
          {todoMissions.map((m) => (
            <MissionCard
              key={m.id}
              mission={m}
              completeLabel={t('child.dashboard.completeMission')}
              onComplete={completeMission}
            />
          ))}
          {completedMissions.map((m) => (
            <MissionCard key={m.id} mission={m} completeLabel="" />
          ))}
        </>
      )}

      {/* ─── Historique récent ─── */}
      {recentTransactions.length > 0 ? (
        <View style={styles.section}>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.text }]}>
            {t('child.dashboard.recentTransactions')}
          </Text>
          <Card>
            {recentTransactions.map((tx) => (
              <TransactionRow key={tx.id} transaction={tx} />
            ))}
          </Card>
          <Link href="/(child)/wishlist/index" style={[styles.link, { color: colors.primary }]}>
            {t('child.dashboard.seeHistory')}
          </Link>
        </View>
      ) : (
        <View style={styles.section}>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.text }]}>
            {t('child.dashboard.recentTransactions')}
          </Text>
          <Card>
            <Text style={{ color: colors.muted, textAlign: 'center' }}>
              {t('child.dashboard.noTransactions')}
            </Text>
          </Card>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 48,
    paddingBottom: 32,
    gap: 16,
  },
  header: {
    marginBottom: 4,
  },
  greeting: {
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontWeight: '700',
    marginTop: 4,
  },
  countBadge: {
    fontSize: 13,
    fontWeight: '400',
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  levelText: {
    fontWeight: '700',
    fontSize: 15,
  },
  xpText: {
    fontSize: 13,
  },
  xpBar: {
    borderRadius: 4,
    height: 8,
  },
  link: {
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 4,
    fontSize: 14,
  },
});
