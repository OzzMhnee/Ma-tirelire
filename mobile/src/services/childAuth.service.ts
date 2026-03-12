import { supabase } from '@config/supabase';
import { safeCall } from '@utils/safeCall';
import type { Child, Mission, WishlistItem, ChildSettings, ServiceResult } from '@/types/domain.types';

function mapChildAuthRpcError(message: string | undefined): string {
  if (!message) return 'Connexion enfant indisponible pour le moment.';

  if (
    message.includes('verify_child_pin_anon') ||
    message.includes('get_child_data_anon') ||
    message.includes('child_add_wish_anon')
  ) {
    return "La connexion enfant n'est pas encore activée sur la base de donnees. Applique la migration SQL 202603120004_child_login.sql dans Supabase, puis recharge le schema.";
  }

  return message;
}

// ─── Mappers ──────────────────────────────────────────────
function rpcRowToChild(row: Record<string, unknown>): Child {
  return {
    id: row.id as string,
    parentId: row.parent_id as string,
    pseudonym: row.pseudonym as string,
    birthYear: (row.birth_year as number) ?? null,
    parentNickname: (row.parent_nickname as string) ?? null,
    avatarId: (row.avatar_id as string) ?? 'default',
    themeId: (row.theme_id as string) ?? 'blue',
    level: (row.level as number) ?? 1,
    experience: (row.experience as number) ?? 0,
    settings: (row.settings as ChildSettings) ?? { font: 'arial', language: 'fr' },
    createdAt: row.created_at as string,
  };
}

function rpcRowToMission(row: Record<string, unknown>): Mission {
  return {
    id: row.id as string,
    parentId: row.parent_id as string,
    childId: row.child_id as string,
    title: row.title as string,
    description: (row.description as string) ?? null,
    reward: row.reward as number,
    status: row.status as Mission['status'],
    createdAt: row.created_at as string,
    completedAt: (row.completed_at as string) ?? null,
    validatedAt: (row.validated_at as string) ?? null,
    validatedBy: (row.validated_by as string) ?? null,
  };
}

function rpcRowToWishlistItem(row: Record<string, unknown>): WishlistItem {
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
    currentBalance: (row.current_balance as number) ?? undefined,
    progressPercent: (row.progress_percent as number) ?? undefined,
    canAfford: (row.can_afford as boolean) ?? undefined,
  };
}

// ─── Service ──────────────────────────────────────────────
export const childAuthService = {
  /** Vérifier pseudo + PIN et retourner les données de l'enfant. */
  async loginChild(
    pseudonym: string,
    pin: string
  ): Promise<ServiceResult<Child>> {
    return safeCall(async () => {
      const { data, error } = await supabase.rpc('verify_child_pin_anon', {
        p_pseudonym: pseudonym,
        p_pin: pin,
      });
      if (error) throw new Error(mapChildAuthRpcError(error.message));
      return rpcRowToChild(data as Record<string, unknown>);
    });
  },

  /** Charger les données enfant (missions, solde, wishlist) via RPC anon. */
  async getChildData(
    childId: string
  ): Promise<
    ServiceResult<{ balance: number; missions: Mission[]; wishlist: WishlistItem[] }>
  > {
    return safeCall(async () => {
      const { data, error } = await supabase.rpc('get_child_data_anon', {
        p_child_id: childId,
      });
      if (error) throw new Error(mapChildAuthRpcError(error.message));
      const payload = data as Record<string, unknown>;
      return {
        balance: (payload.balance as number) ?? 0,
        missions: ((payload.missions as Record<string, unknown>[]) ?? []).map(
          rpcRowToMission
        ),
        wishlist: ((payload.wishlist as Record<string, unknown>[]) ?? []).map(
          rpcRowToWishlistItem
        ),
      };
    });
  },

  /** Ajouter un souhait (mode enfant autonome). */
  async addWishlistItem(
    childId: string,
    name: string,
    price: number,
    imageUrl?: string
  ): Promise<ServiceResult<WishlistItem>> {
    return safeCall(async () => {
      const { data, error } = await supabase.rpc('child_add_wish_anon', {
        p_child_id: childId,
        p_name: name,
        p_price: price,
        p_image_url: imageUrl ?? null,
      });
      if (error) throw new Error(mapChildAuthRpcError(error.message));
      return rpcRowToWishlistItem(data as Record<string, unknown>);
    });
  },
};
