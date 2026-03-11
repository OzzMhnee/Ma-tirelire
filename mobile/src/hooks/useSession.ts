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
  const { user, setUser, setLoading } = useAuthStore();
  const { setChildren } = useChildrenStore();

  useEffect(() => {
    let mounted = true;

    const hydrateSession = async () => {
      setLoading(true);
      const session = await authService.getSession();

      if (!session || !mounted) {
        setLoading(false);
        return;
      }

      // Charger le profil parent
      const result = await authService.signInParent(
        session.user.email ?? '',
        '' // JWT déjà valide — Supabase l'utilisera via la session
      );

      if (result.data && mounted) {
        setUser(result.data);

        // Pré-charger les enfants
        const childrenResult = await childrenService.getChildren(
          result.data.id
        );
        if (childrenResult.data && mounted) {
          setChildren(childrenResult.data);
        }
      }

      setLoading(false);
    };

    hydrateSession();

    const { data: subscription } = authService.onAuthStateChange(
      (event) => {
        if (event === 'SIGNED_OUT') {
          router.replace('/(auth)/login');
        }
      }
    );

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [setUser, setLoading, setChildren]);

  return { user };
}
