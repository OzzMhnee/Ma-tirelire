import { supabase } from '@config/supabase';
import { safeCall } from '@utils/safeCall';
import type { WishlistItem, ServiceResult } from '@types/domain.types';

function dbRowToWishlistItem(row: Record<string, unknown>): WishlistItem {
  return {
    id: row.id as string,
    childId: row.child_id as string,
    productName: row.product_name as string,
    productImageUrl: (row.product_image_url as string) ?? null,
    productPrice: row.product_price as number,
    productCurrency: (row.product_currency as string) ?? 'EUR',
    productSource: (row.product_source as string) ?? null,
    productRef: (row.product_ref as string) ?? null,
    addedAt: row.added_at as string,
    purchasedAt: (row.purchased_at as string) ?? null,
    notes: (row.notes as string) ?? null,
    // Champs calculés (présents dans la vue wishlist_progress)
    currentBalance: (row.current_balance as number) ?? undefined,
    progressPercent: (row.progress_percent as number) ?? undefined,
    canAfford: (row.can_afford as boolean) ?? undefined,
  };
}

export const wishlistService = {
  async getWishlist(childId: string): Promise<ServiceResult<WishlistItem[]>> {
    return safeCall(async () => {
      // Utiliser la vue avec progression calculée
      const { data, error } = await supabase
        .from('wishlist_progress')
        .select('*')
        .eq('child_id', childId)
        .is('purchased_at', null)
        .order('added_at', { ascending: false });

      if (error) throw new Error(error.message);
      return (data ?? []).map(dbRowToWishlistItem);
    });
  },

  async addToWishlist(data: {
    childId: string;
    productName: string;
    productPrice: number;
    productImageUrl?: string;
    productSource?: string;
    productRef?: string;
    notes?: string;
  }): Promise<ServiceResult<WishlistItem>> {
    return safeCall(async () => {
      const { data: item, error } = await supabase
        .from('wishlists')
        .insert({
          child_id: data.childId,
          product_name: data.productName,
          product_price: data.productPrice,
          product_image_url: data.productImageUrl ?? null,
          product_source: data.productSource ?? null,
          product_ref: data.productRef ?? null,
          notes: data.notes ?? null,
        })
        .select()
        .single();

      if (error || !item) throw new Error(error?.message ?? 'Erreur ajout wishlist.');
      return dbRowToWishlistItem(item);
    });
  },

  async removeFromWishlist(itemId: string): Promise<ServiceResult<void>> {
    return safeCall(async () => {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('id', itemId);
      if (error) throw new Error(error.message);
    });
  },

  async markPurchased(itemId: string): Promise<ServiceResult<WishlistItem>> {
    return safeCall(async () => {
      const { data, error } = await supabase
        .from('wishlists')
        .update({ purchased_at: new Date().toISOString() })
        .eq('id', itemId)
        .select()
        .single();

      if (error || !data) throw new Error(error?.message ?? 'Erreur mise à jour.');
      return dbRowToWishlistItem(data);
    });
  },
};
