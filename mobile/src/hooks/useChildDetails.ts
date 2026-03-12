import { useCallback, useEffect, useState } from 'react';

import { achievementsService } from '@services/achievements.service';
import { childrenService } from '@services/children.service';
import { missionsService } from '@services/missions.service';
import { transactionsService } from '@services/transactions.service';
import { wishlistService } from '@services/wishlist.service';
import { useChildrenStore } from '@store/childrenStore';
import type { Achievement, Child, Mission, Transaction, WishlistItem } from '@/types/domain.types';

type Params = {
  childId?: string;
  parentId?: string;
  manualDepositLabel: string;
  defaultErrorMessage: string;
};

export function useChildDetails({ childId, parentId, manualDepositLabel, defaultErrorMessage }: Params) {
  const updateChildInStore = useChildrenStore((state) => state.updateChild);

  const [child, setChild] = useState<Child | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!childId || !parentId) return;

    setError(null);
    const [childResult, transactionsResult, missionsResult, wishlistResult, achievementsResult] = await Promise.all([
      childrenService.getChildWithBalance(childId),
      transactionsService.getTransactions(childId),
      missionsService.getMissions(parentId, childId),
      wishlistService.getWishlist(childId),
      achievementsService.getAchievements(childId),
    ]);

    if (childResult.data) {
      setChild(childResult.data);
      updateChildInStore(childResult.data.id, childResult.data);
    } else {
      setError(childResult.error?.message ?? defaultErrorMessage);
    }

    if (transactionsResult.data) {
      setTransactions(transactionsResult.data);
    }

    if (missionsResult.data) {
      setMissions(missionsResult.data);
    }

    if (wishlistResult.data) {
      setWishlist(wishlistResult.data);
    }

    if (achievementsResult.data) {
      setAchievements(achievementsResult.data);
    }
  }, [childId, defaultErrorMessage, parentId, updateChildInStore]);

  useEffect(() => {
    load();
  }, [load]);

  const addMoney = useCallback(
    async (amount: number) => {
      if (!child || !parentId) return;

      const result = await transactionsService.createManualTransaction({
        childId: child.id,
        type: 'manual_deposit',
        amount,
        description: manualDepositLabel,
        createdBy: parentId,
      });

      if (result.error) {
        setError(result.error.message ?? defaultErrorMessage);
        return;
      }

      const nextBalance = (child.balance ?? 0) + amount;
      setChild((previousChild) => previousChild ? { ...previousChild, balance: nextBalance } : previousChild);
      updateChildInStore(child.id, { balance: nextBalance });
      await load();
    },
    [child, defaultErrorMessage, load, manualDepositLabel, parentId, updateChildInStore]
  );

  return {
    child,
    wishlist,
    error,
    recentTransactions: transactions.slice(0, 10),
    pendingMissions: missions.filter((mission) => mission.status === 'pending'),
    waitingValidationMissions: missions.filter((mission) => mission.status === 'completed'),
    unlockedBadges: achievements.filter((achievement) => achievement.type === 'badge'),
    addMoney,
  };
}