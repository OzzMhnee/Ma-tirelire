import { supabase } from '@config/supabase';
import { safeCall } from '@utils/safeCall';
import type { Achievement, AchievementType, ServiceResult } from '@/types/domain.types';

function dbRowToAchievement(row: Record<string, unknown>): Achievement {
  return {
    id: row.id as string,
    childId: row.child_id as string,
    type: row.type as AchievementType,
    itemId: row.item_id as string,
    unlockedAt: row.unlocked_at as string,
  };
}

export const achievementsService = {
  async getAchievements(childId: string): Promise<ServiceResult<Achievement[]>> {
    return safeCall(async () => {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('child_id', childId)
        .order('unlocked_at', { ascending: false });

      if (error) throw new Error(error.message);
      return (data ?? []).map(dbRowToAchievement);
    });
  },
};