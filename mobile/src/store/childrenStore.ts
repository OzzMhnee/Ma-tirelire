import { create } from 'zustand';
import type { Child } from '@/types/domain.types';

interface ChildrenState {
  children: Child[];
  selectedChild: Child | null;
  isLoading: boolean;
  error: string | null;

  setChildren: (children: Child[]) => void;
  addChild: (child: Child) => void;
  updateChild: (id: string, updates: Partial<Child>) => void;
  removeChild: (id: string) => void;
  selectChild: (child: Child | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useChildrenStore = create<ChildrenState>((set) => ({
  children: [],
  selectedChild: null,
  isLoading: false,
  error: null,

  setChildren: (children) => set({ children }),
  addChild: (child) =>
    set((state) => ({ children: [...state.children, child] })),
  updateChild: (id, updates) =>
    set((state) => ({
      children: state.children.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),
  removeChild: (id) =>
    set((state) => ({
      children: state.children.filter((c) => c.id !== id),
    })),
  selectChild: (child) => set({ selectedChild: child }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
