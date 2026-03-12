import { useCallback, useEffect, useState } from 'react';

import { useAuthStore } from '@store/authStore';
import { wishlistService } from '@services/wishlist.service';
import { childAuthService } from '@services/childAuth.service';
import type { WishlistItem } from '@/types/domain.types';

/**
 * Hook pour l'écran wishlist enfant.
 * Charge et rafraîchit la liste de souhaits.
 * Supporte le mode enfant autonome (pas de session parent).
 */
export function useWishlist() {
  const user = useAuthStore((s) => s.user);
  const activeChild = useAuthStore((s) => s.activeChild);
  const isStandaloneChild = !user && !!activeChild;
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!activeChild?.id) return;
    if (isStandaloneChild) {
      // Mode enfant autonome — utiliser le RPC
      const res = await childAuthService.getChildData(activeChild.id);
      if (!res.error && res.data) setItems(res.data.wishlist);
    } else {
      const res = await wishlistService.getWishlist(activeChild.id);
      if (!res.error && res.data) setItems(res.data);
    }
  }, [activeChild?.id, isStandaloneChild]);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return { items, refreshing, refresh };
}
