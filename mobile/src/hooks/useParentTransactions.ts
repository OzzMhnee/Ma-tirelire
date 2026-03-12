import { useCallback, useEffect, useState } from 'react';

import { useExpandableList } from './useExpandableList';
import { transactionsService } from '@services/transactions.service';
import { useChildrenStore } from '@store/childrenStore';
import type { Child, Transaction } from '@/types/domain.types';

type ChildTransactionGroup = {
  childId: string;
  childName: string;
  items: Transaction[];
};

/**
 * Hook pour l'écran historique des transactions parent.
 * Charge les transactions de tous les enfants, regroupe par enfant,
 * et gère l'expand/collapse via useExpandableList.
 */
export function useParentTransactions(filterChildId?: string) {
  const children = useChildrenStore((s) => s.children);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { toggle, isExpanded, getDisplayedItems } = useExpandableList();

  const load = useCallback(async () => {
    if (!children.length) return;
    const results = await Promise.all(
      children.map((c) => transactionsService.getTransactions(c.id)),
    );
    const merged = results
      .flatMap((r) => (!r.error && r.data ? r.data : []))
      .filter((tx) => (filterChildId ? tx.childId === filterChildId : true))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setAllTransactions(merged);
  }, [children, filterChildId]);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  // Regrouper par enfant
  const childById = new Map<string, Child>(children.map((c) => [c.id, c]));
  const groups: ChildTransactionGroup[] = [];
  const byChild: Record<string, Transaction[]> = {};

  for (const tx of allTransactions) {
    if (!byChild[tx.childId]) byChild[tx.childId] = [];
    byChild[tx.childId].push(tx);
  }

  for (const [childId, items] of Object.entries(byChild)) {
    groups.push({
      childId,
      childName: childById.get(childId)?.pseudonym ?? childId,
      items,
    });
  }

  return {
    groups,
    isEmpty: allTransactions.length === 0,
    refreshing,
    refresh,
    toggle,
    isExpanded,
    getDisplayedItems,
  };
}
