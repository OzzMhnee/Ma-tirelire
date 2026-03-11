import { supabase } from '@config/supabase';
import { safeCall } from '@utils/safeCall';
import type { Mission, MissionStatus, ServiceResult } from '@types/domain.types';

function dbRowToMission(row: Record<string, unknown>): Mission {
  return {
    id: row.id as string,
    parentId: row.parent_id as string,
    childId: row.child_id as string,
    title: row.title as string,
    description: (row.description as string) ?? null,
    reward: row.reward as number,
    status: row.status as MissionStatus,
    createdAt: row.created_at as string,
    completedAt: (row.completed_at as string) ?? null,
    validatedAt: (row.validated_at as string) ?? null,
    validatedBy: (row.validated_by as string) ?? null,
  };
}

export const missionsService = {
  async getMissions(
    parentId: string,
    childId?: string
  ): Promise<ServiceResult<Mission[]>> {
    return safeCall(async () => {
      let query = supabase
        .from('missions')
        .select('*')
        .eq('parent_id', parentId)
        .order('created_at', { ascending: false });

      if (childId) query = query.eq('child_id', childId);

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return (data ?? []).map(dbRowToMission);
    });
  },

  async createMission(data: {
    parentId: string;
    childId: string;
    title: string;
    description?: string;
    reward: number;
  }): Promise<ServiceResult<Mission>> {
    return safeCall(async () => {
      const { data: mission, error } = await supabase
        .from('missions')
        .insert({
          parent_id: data.parentId,
          child_id: data.childId,
          title: data.title,
          description: data.description ?? null,
          reward: data.reward,
        })
        .select()
        .single();

      if (error || !mission) throw new Error(error?.message ?? 'Erreur création.');
      return dbRowToMission(mission);
    });
  },

  async markCompleted(missionId: string): Promise<ServiceResult<Mission>> {
    return safeCall(async () => {
      const { data, error } = await supabase
        .from('missions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', missionId)
        .select()
        .single();

      if (error || !data) throw new Error(error?.message ?? 'Erreur mise à jour.');
      return dbRowToMission(data);
    });
  },

  /**
   * Valide une mission ET crée la transaction de récompense de façon atomique.
   */
  async validateMission(
    missionId: string,
    parentId: string
  ): Promise<ServiceResult<Mission>> {
    return safeCall(async () => {
      // Récupérer la mission
      const { data: mission, error: fetchError } = await supabase
        .from('missions')
        .select('*')
        .eq('id', missionId)
        .single();

      if (fetchError || !mission) throw new Error('Mission introuvable.');
      if (mission.status !== 'completed') {
        throw new Error('La mission doit être marquée terminée par l\'enfant.');
      }

      const now = new Date().toISOString();

      // Mise à jour + transaction dans deux opérations consécutives
      const { data: updated, error: updateError } = await supabase
        .from('missions')
        .update({
          status: 'validated',
          validated_at: now,
          validated_by: parentId,
        })
        .eq('id', missionId)
        .select()
        .single();

      if (updateError || !updated) throw new Error(updateError?.message ?? 'Erreur validation.');

      // Créer la transaction de récompense (ledger)
      const { error: txError } = await supabase.from('transactions').insert({
        child_id: mission.child_id,
        type: 'mission_reward',
        amount: mission.reward,
        description: `Récompense : ${mission.title}`,
        reference_id: missionId,
        created_by: parentId,
      });

      if (txError) throw new Error(txError.message);

      return dbRowToMission(updated);
    });
  },

  async rejectMission(missionId: string): Promise<ServiceResult<Mission>> {
    return safeCall(async () => {
      const { data, error } = await supabase
        .from('missions')
        .update({ status: 'rejected' })
        .eq('id', missionId)
        .select()
        .single();

      if (error || !data) throw new Error(error?.message ?? 'Erreur rejet.');
      return dbRowToMission(data);
    });
  },
};
