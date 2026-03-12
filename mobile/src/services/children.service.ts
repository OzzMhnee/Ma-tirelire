import { supabase } from '@config/supabase';
import { safeCall } from '@utils/safeCall';
import type { Child, ServiceResult, ChildSettings } from '@/types/domain.types';
import type { Database } from '@/types/database.types';

type ChildRow = Database['public']['Tables']['children']['Row'];

function isMissingParentNicknameColumnError(message: string | undefined): boolean {
  if (!message) return false;
  return message.includes("Could not find the 'parent_nickname' column of 'children' in the schema cache");
}

async function insertChildWithOptionalParentNickname(
  parentId: string,
  data: {
    pseudonym: string;
    birthYear?: number;
    parentNickname?: string;
    font?: ChildSettings['font'];
    language?: ChildSettings['language'];
  }
) {
  const basePayload = {
    parent_id: parentId,
    pseudonym: data.pseudonym,
    birth_year: data.birthYear ?? null,
    settings: {
      font: data.font ?? 'arial',
      language: data.language ?? 'fr',
    },
  };

  const withParentNickname = await supabase
    .from('children')
    .insert({
      ...basePayload,
      parent_nickname: data.parentNickname ?? null,
    })
    .select('*')
    .single();

  if (!withParentNickname.error || !isMissingParentNicknameColumnError(withParentNickname.error.message)) {
    return withParentNickname;
  }

  const withoutParentNickname = await supabase
    .from('children')
    .insert(basePayload)
    .select('*')
    .single();

  return withoutParentNickname;
}

function dbRowToChild(row: Record<string, unknown>): Child {
  return {
    id: row.id as string,
    parentId: row.parent_id as string,
    pseudonym: row.pseudonym as string,
    birthYear: (row.birth_year as number) ?? null,
    pinConfigured: Boolean(row.child_pin_hash),
    pinUpdatedAt: (row.child_pin_updated_at as string) ?? null,
    avatarId: (row.avatar_id as string) ?? 'default',
    themeId: (row.theme_id as string) ?? 'blue',
    level: (row.level as number) ?? 1,
    experience: (row.experience as number) ?? 0,
    parentNickname: (row.parent_nickname as string) ?? null,
    settings: row.settings as ChildSettings,
    createdAt: row.created_at as string,
  };
}

export const childrenService = {
  async getChildren(parentId: string): Promise<ServiceResult<Child[]>> {
    return safeCall(async () => {
      const [{ data, error }, { data: balances, error: balancesError }] = await Promise.all([
        supabase
          .from('children')
          .select('*')
          .eq('parent_id', parentId)
          .order('created_at', { ascending: true }),
        supabase.from('child_balances').select('child_id, balance'),
      ]);

      if (error) throw new Error(error.message);
      if (balancesError) throw new Error(balancesError.message);

      const balanceByChildId = new Map(
        (balances ?? []).map((item) => [item.child_id, item.balance])
      );

      return (data ?? []).map((child) => ({
        ...dbRowToChild(child as ChildRow),
        balance: balanceByChildId.get((child as ChildRow).id) ?? 0,
      }));
    });
  },

  async getChildWithBalance(childId: string): Promise<ServiceResult<Child>> {
    return safeCall(async () => {
      const [{ data: child, error: childError }, { data: balance }] =
        await Promise.all([
          supabase.from('children').select('*').eq('id', childId).single(),
          supabase
            .from('child_balances')
            .select('balance')
            .eq('child_id', childId)
            .single(),
        ]);

      if (childError || !child) throw new Error(childError?.message ?? 'Introuvable.');

      return { ...dbRowToChild(child), balance: balance?.balance ?? 0 };
    });
  },

  async createChild(
    parentId: string,
    data: {
      pseudonym: string;
      birthYear?: number;
      pin: string;
      parentNickname?: string;
      font?: ChildSettings['font'];
      language?: ChildSettings['language'];
    }
  ): Promise<ServiceResult<Child>> {
    return safeCall(async () => {
      const { data: child, error } = await insertChildWithOptionalParentNickname(parentId, data);

      if (error || !child) throw new Error(error?.message ?? 'Erreur création.');

      const createdChild = dbRowToChild(child);
      const { error: pinError } = await supabase.rpc('set_child_pin', {
        child_uuid: createdChild.id,
        plain_pin: data.pin,
      });

      if (pinError) {
        await supabase.from('children').delete().eq('id', createdChild.id);
        throw new Error(pinError.message);
      }

      return {
        ...createdChild,
        pinConfigured: true,
        pinUpdatedAt: new Date().toISOString(),
      };
    });
  },

  async setChildPin(childId: string, pin: string): Promise<ServiceResult<void>> {
    return safeCall(async () => {
      const { error } = await supabase.rpc('set_child_pin', {
        child_uuid: childId,
        plain_pin: pin,
      });

      if (error) throw new Error(error.message);
    });
  },

  async updateChild(
    childId: string,
    updates: Partial<{
      pseudonym: string;
      birthYear: number;
      avatarId: string;
      themeId: string;
      settings: Partial<ChildSettings>;
    }>
  ): Promise<ServiceResult<Child>> {
    return safeCall(async () => {
      const payload: Record<string, unknown> = {};
      if (updates.pseudonym !== undefined) payload.pseudonym = updates.pseudonym;
      if (updates.birthYear !== undefined) payload.birth_year = updates.birthYear;
      if (updates.avatarId !== undefined) payload.avatar_id = updates.avatarId;
      if (updates.themeId !== undefined) payload.theme_id = updates.themeId;
      if (updates.settings !== undefined) payload.settings = updates.settings;
      payload.updated_at = new Date().toISOString();

      const { data: child, error } = await supabase
        .from('children')
        .update(payload)
        .eq('id', childId)
        .select("*")
        .single();

      if (error || !child) throw new Error(error?.message ?? 'Erreur mise à jour.');
      return dbRowToChild(child);
    });
  },

  async deleteChild(childId: string): Promise<ServiceResult<void>> {
    return safeCall(async () => {
      const { error } = await supabase.rpc('delete_child_account', {
        child_uuid: childId,
      });
      if (error) throw new Error(error.message);
    });
  },
};
