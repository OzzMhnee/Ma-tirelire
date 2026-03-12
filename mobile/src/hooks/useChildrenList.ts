import { useCallback, useEffect, useState } from 'react';

import { childrenService } from '@services/children.service';
import { useAuthStore } from '@store/authStore';
import { useChildrenStore } from '@store/childrenStore';

/**
 * Hook pour l'écran liste des enfants.
 * Charge les enfants via le service et synchronise le store.
 */
export function useChildrenList() {
  const user = useAuthStore((s) => s.user);
  const children = useChildrenStore((s) => s.children);
  const setChildren = useChildrenStore((s) => s.setChildren);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const res = await childrenService.getChildren(user.id);
    if (!res.error && res.data) setChildren(res.data);
  }, [user, setChildren]);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return { children, refreshing, refresh };
}
