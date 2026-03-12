import { useEffect } from 'react';
import { router } from 'expo-router';
import { authService } from '@services/auth.service';
import { useAuthStore } from '@store/authStore';
import { childrenService } from '@services/children.service';
import { useChildrenStore } from '@store/childrenStore';

/**
 * Hydrate la session au démarrage de l'app et gère les redirections.
 * À placer dans _layout.tsx racine.
 */
export function useSession() {
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    let mounted = true;

    const hydrateSession = async () => {
      // Accès aux actions via getState() : pas de subscription, références stables
      const { setUser, setLoading } = useAuthStore.getState();
      const { setChildren } = useChildrenStore.getState();

      setLoading(true);
      const session = await authService.getSession();

      if (!session || !mounted) {
        useAuthStore.getState().setLoading(false);
        return;
      }

      // Récupérer le profil parent via la session Supabase active
      const profile = await authService.getProfile(session.user.id);

      if (profile.data && mounted) {
        setUser(profile.data);

        // Pré-charger les enfants
        const childrenResult = await childrenService.getChildren(profile.data.id);
        if (childrenResult.data && mounted) {
          setChildren(childrenResult.data);
        }
      }

      useAuthStore.getState().setLoading(false);
    };

    hydrateSession();

    const { data: subscription } = authService.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        router.replace('/(auth)/login');
      }
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { user };
}
