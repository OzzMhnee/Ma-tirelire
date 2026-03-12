import { create } from 'zustand';
import type { Mission } from '@/types/domain.types';

interface MissionsState {
  missions: Mission[];
  isLoading: boolean;
  error: string | null;

  setMissions: (missions: Mission[]) => void;
  addMission: (mission: Mission) => void;
  updateMission: (id: string, updates: Partial<Mission>) => void;
  removeMission: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useMissionsStore = create<MissionsState>((set) => ({
  missions: [],
  isLoading: false,
  error: null,

  setMissions: (missions) => set({ missions }),
  addMission: (mission) =>
    set((state) => ({ missions: [...state.missions, mission] })),
  updateMission: (id, updates) =>
    set((state) => ({
      missions: state.missions.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    })),
  removeMission: (id) =>
    set((state) => ({
      missions: state.missions.filter((m) => m.id !== id),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
