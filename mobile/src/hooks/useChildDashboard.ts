import { useCallback, useEffect, useState } from 'react';

import { useAuthStore } from '@store/authStore';
import { useMissions } from './useMissions';
import { useChildBalance } from './useTransactions';
import { wishlistService } from '@services/wishlist.service';
import { childAuthService } from '@services/childAuth.service';
import type { Mission, WishlistItem } from '@/types/domain.types';

/**
 * Hook pour le dashboard enfant.
 * Orchestre le chargement du solde, des missions et de la wishlist.
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

  // État local pour le mode autonome
  const [standaloneBalance, setStandaloneBalance] = useState(0);
  const [standaloneMissions, setStandaloneMissions] = useState<Mission[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!activeChild) return;

    if (isStandaloneChild) {
      // Mode enfant autonome — appel RPC unique
      const res = await childAuthService.getChildData(activeChild.id);
      if (!res.error && res.data) {
        setStandaloneBalance(res.data.balance);
        setStandaloneMissions(res.data.missions);
        setWishlist(res.data.wishlist);
      }
    } else {
      // Mode parent — appels classiques
      await Promise.all([refreshBalance(), refreshMissions()]);
      const wRes = await wishlistService.getWishlist(activeChild.id);
      if (!wRes.error && wRes.data) setWishlist(wRes.data);
    }
  }, [activeChild, isStandaloneChild, refreshBalance, refreshMissions]);

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
  const todoMissions: Mission[] = missions.filter((m) => m.status === 'pending');

  return {
    activeChild,
    balance,
    todoMissions,
    topWish: wishlist[0] ?? null,
    isLoading: (isStandaloneChild ? false : parentLoading) || refreshing,
    refresh,
  };
}
