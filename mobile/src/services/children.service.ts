import { supabase } from '@config/supabase';
import { safeCall } from '@utils/safeCall';
import type { Child, ServiceResult, ChildSettings } from '@types/domain.types';

function dbRowToChild(row: Record<string, unknown>): Child {
  return {
    id: row.id as string,
    parentId: row.parent_id as string,
    pseudonym: row.pseudonym as string,
    birthYear: (row.birth_year as number) ?? null,
    avatarId: (row.avatar_id as string) ?? 'default',
    themeId: (row.theme_id as string) ?? 'blue',
    level: (row.level as number) ?? 1,
    experience: (row.experience as number) ?? 0,
    settings: row.settings as ChildSettings,
    createdAt: row.created_at as string,
  };
}

export const childrenService = {
  async getChildren(parentId: string): Promise<ServiceResult<Child[]>> {
    return safeCall(async () => {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('parent_id', parentId)
        .order('created_at', { ascending: true });

      if (error) throw new Error(error.message);
      return (data ?? []).map(dbRowToChild);
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
      font?: ChildSettings['font'];
      language?: ChildSettings['language'];
    }
  ): Promise<ServiceResult<Child>> {
    return safeCall(async () => {
      const { data: child, error } = await supabase
        .from('children')
        .insert({
          parent_id: parentId,
          pseudonym: data.pseudonym,
          birth_year: data.birthYear ?? null,
          settings: {
            font: data.font ?? 'arial',
            language: data.language ?? 'fr',
          },
        })
        .select()
        .single();

      if (error || !child) throw new Error(error?.message ?? 'Erreur création.');
      return dbRowToChild(child);
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
        .select()
        .single();

      if (error || !child) throw new Error(error?.message ?? 'Erreur mise à jour.');
      return dbRowToChild(child);
    });
  },

  async deleteChild(childId: string): Promise<ServiceResult<void>> {
    return safeCall(async () => {
      const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', childId);
      if (error) throw new Error(error.message);
    });
  },
};
