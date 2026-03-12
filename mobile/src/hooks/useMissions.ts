import { useEffect, useCallback } from 'react';
import { missionsService } from '@services/missions.service';
import { useMissionsStore } from '@store/missionsStore';
import { useAuthStore } from '@store/authStore';

export function useMissions(childId?: string) {
  const user = useAuthStore((s) => s.user);
  const { missions, isLoading, error, setMissions, updateMission, removeMission, setLoading, setError } =
    useMissionsStore();

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const result = await missionsService.getMissions(user.id, childId);
    setLoading(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    setMissions(result.data ?? []);
  }, [user, childId, setMissions, setLoading, setError]);

  useEffect(() => {
    load();
  }, [load]);

  const validate = useCallback(
    async (missionId: string) => {
      if (!user) return;
      const result = await missionsService.validateMission(missionId, user.id);
      if (result.data) updateMission(missionId, result.data);
      return result;
    },
    [user, updateMission]
  );

  const deleteMission = useCallback(
    async (missionId: string) => {
      if (!user) return;
      const result = await missionsService.deleteMission(missionId);
      if (!result.error) removeMission(missionId);
      return result;
    },
    [user, removeMission]
  );

  return { missions, isLoading, error, refresh: load, validate, deleteMission };
}
