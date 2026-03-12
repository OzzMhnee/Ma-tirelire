import { useMemo } from 'react';

import { useExpandableList } from './useExpandableList';
import type { Child, Mission } from '@/types/domain.types';

export type MissionSection = {
  childId: string;
  childName: string;
  pending: Mission[];
  completed: Mission[];
};

/**
 * Regroupe les missions par enfant et gère l'expand/collapse des sections.
 * Logique pure de regroupement + délègue expand/collapse à useExpandableList.
 */
export function useParentMissionSections(missions: Mission[], children: Child[]) {
  const { toggle, isExpanded, getDisplayedItems } = useExpandableList();

  const sections: MissionSection[] = useMemo(() => {
    const childrenById = new Map(children.map((child) => [child.id, child]));
    const missionsByChild = missions.reduce<Record<string, Mission[]>>((acc, mission) => {
      if (!acc[mission.childId]) acc[mission.childId] = [];
      acc[mission.childId].push(mission);
      return acc;
    }, {});

    return Object.entries(missionsByChild).map(([childId, childMissions]) => ({
      childId,
      childName: childrenById.get(childId)?.pseudonym ?? childId,
      pending: childMissions.filter((m) => m.status === 'pending'),
      completed: childMissions.filter((m) => m.status === 'completed'),
    }));
  }, [missions, children]);

  return {
    sections,
    toggleSection: toggle,
    isExpanded,
    getDisplayedItems,
  };
}