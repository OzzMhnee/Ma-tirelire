import { useCallback, useEffect, useState } from 'react';
import { router } from 'expo-router';

import { childrenService } from '@services/children.service';
import { missionsService } from '@services/missions.service';
import { useAuthStore } from '@store/authStore';
import { useChildrenStore } from '@store/childrenStore';
import { useMissionsStore } from '@store/missionsStore';

export function useParentDashboard() {
  const user = useAuthStore((state) => state.user);
  const children = useChildrenStore((state) => state.children);
  const setChildren = useChildrenStore((state) => state.setChildren);
  const missions = useMissionsStore((state) => state.missions);
  const setMissions = useMissionsStore((state) => state.setMissions);

  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;

    setError(null);
    const [childrenResult, missionsResult] = await Promise.all([
      childrenService.getChildren(user.id),
      missionsService.getMissions(user.id),
    ]);

    if (childrenResult.data) {
      setChildren(childrenResult.data);
    }

    if (missionsResult.data) {
      setMissions(missionsResult.data);
    }

    if (childrenResult.error || missionsResult.error) {
      setError(childrenResult.error?.message ?? missionsResult.error?.message ?? null);
    }
  }, [setChildren, setMissions, user]);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const openMissionCreation = useCallback(() => {
    if (children.length === 1) {
      router.push({
        pathname: '/(parent)/missions/new',
        params: { childId: children[0].id, lockChild: 'true' },
      });
      return;
    }

    router.push('/(parent)/missions/new');
  }, [children]);

  const pendingMissions = missions.filter((mission) => mission.status === 'pending');

  return {
    user,
    children,
    pendingMissions,
    refreshing,
    error,
    refresh,
    openMissionCreation,
  };
}