import { useCallback, useEffect, useState } from 'react';

import { useAuthStore } from '@store/authStore';
import { useMissions } from './useMissions';
import { useChildBalance, useTransactions } from './useTransactions';
import { wishlistService } from '@services/wishlist.service';
import { childAuthService } from '@services/childAuth.service';
import { missionsService } from '@services/missions.service';
import type { Mission, WishlistItem, Transaction } from '@/types/domain.types';

/** XP nécessaire pour atteindre le niveau suivant. */
function xpForNextLevel(level: number): number {
  return level * 100;
}

/**
 * Hook pour le dashboard enfant complet.
 * Orchestre le chargement du solde, des missions, de la wishlist et des transactions.
 * Supporte le mode enfant autonome (pas de session parent).
 */
export function useChildDashboard() {
  const user = useAuthStore((s) => s.user);
  const activeChild = useAuthStore((s) => s.activeChild);
  const childId = activeChild?.id ?? '';
  const isStandaloneChild = !user && !!activeChild;

  // Hooks classiques (mode parent)
  const { balance: parentBalance, refresh: refreshBalance } = useChildBalance(childId);
  const { missions: parentMissions, isLoading: parentLoading, refresh: refreshMissions } = useMissions(childId);
  const { transactions: parentTransactions, refresh: refreshTransactions } = useTransactions(childId);

  // État local pour le mode autonome
  const [standaloneBalance, setStandaloneBalance] = useState(0);
  const [standaloneMissions, setStandaloneMissions] = useState<Mission[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!activeChild) return;

    if (isStandaloneChild) {
      const res = await childAuthService.getChildData(activeChild.id);
      if (!res.error && res.data) {
        setStandaloneBalance(res.data.balance);
        setStandaloneMissions(res.data.missions);
        setWishlist(res.data.wishlist);
      }
    } else {
      await Promise.all([refreshBalance(), refreshMissions(), refreshTransactions()]);
      const wRes = await wishlistService.getWishlist(activeChild.id);
      if (!wRes.error && wRes.data) setWishlist(wRes.data);
    }
  }, [activeChild, isStandaloneChild, refreshBalance, refreshMissions, refreshTransactions]);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const balance = isStandaloneChild ? standaloneBalance : parentBalance;
  const missions = isStandaloneChild ? standaloneMissions : parentMissions;
  const transactions: Transaction[] = isStandaloneChild ? [] : parentTransactions;

  const todoMissions = missions.filter((m) => m.status === 'pending');
  const completedMissions = missions.filter((m) => m.status === 'completed');
  const validatedMissions = missions.filter((m) => m.status === 'validated');

  const level = activeChild?.level ?? 1;
  const experience = activeChild?.experience ?? 0;
  const xpNext = xpForNextLevel(level);
  const xpProgress = xpNext > 0 ? Math.min(experience / xpNext, 1) : 0;

  /** L'enfant marque une mission comme terminée. */
  const completeMission = useCallback(
    async (missionId: string) => {
      const result = await missionsService.markCompleted(missionId);
      if (!result.error) await load();
      return result;
    },
    [load],
  );

  return {
    activeChild,
    balance,
    todoMissions,
    completedMissions,
    validatedMissions,
    topWish: wishlist[0] ?? null,
    wishlist,
    recentTransactions: transactions.slice(0, 5),
    level,
    experience,
    xpNext,
    xpProgress,
    completeMission,
    isLoading: (isStandaloneChild ? false : parentLoading) || refreshing,
    refresh,
  };
}
