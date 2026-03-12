import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ParentUser, AppRole, Child } from '@/types/domain.types';

interface AuthState {
  // État
  user: ParentUser | null;
  role: AppRole | null;
  /** Enfant actif (mode enfant) */
  activeChild: Child | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: ParentUser) => void;
  setRole: (role: AppRole) => void;
  setActiveChild: (child: Child | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      role: null,
      activeChild: null,
      isLoading: true,  // true jusqu'à ce que useSession termine
      error: null,

      setUser: (user) => set({ user }),
      setRole: (role) => set({ role }),
      setActiveChild: (child) => set({ activeChild: child }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      logout: () =>
        set({ user: null, role: null, activeChild: null, error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Ne pas persister l'état de chargement ni les erreurs
      partialize: (state) => ({
        user: state.user,
        role: state.role,
        activeChild: state.activeChild,
      }),
      // skipHydration: évite que persist appelle setState pendant le montage
      // (sinon React 19 useSyncExternalStore détecte un snapshot modifié → boucle infinie)
      skipHydration: true,
    }
  )
);

// Sélecteurs dérivés (évite les re-renders inutiles)
export const useIsLoggedIn = () => useAuthStore((s) => s.user !== null);
export const useCurrentUser = () => useAuthStore((s) => s.user);
export const useCurrentRole = () => useAuthStore((s) => s.role);
export const useActiveChild = () => useAuthStore((s) => s.activeChild);
