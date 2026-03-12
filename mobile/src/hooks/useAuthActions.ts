import { useCallback } from 'react';
import { authService } from '@services/auth.service';
import { useAuthStore } from '@store/authStore';
import type { LoginForm, SignUpForm } from '@utils/validators';

/**
 * Hook centralisé pour toutes les actions d'authentification.
 * Les écrans ne doivent jamais appeler authService directement.
 *
 * Retourne des booléens/résultats — la navigation est gérée par l'écran appelant.
 */
export function useAuthActions() {
  const { setUser, setLoading, setError, logout: storeLogout } = useAuthStore.getState();

  const signIn = useCallback(
    async (form: LoginForm) => {
      setLoading(true);
      setError(null);
      const result = await authService.signInParent(
        form.identifier,
        form.password
      );
      setLoading(false);
      if (result.error) {
        setError(result.error.message);
        return false;
      }
      setUser(result.data!);
      return true;
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const signUp = useCallback(
    async (form: SignUpForm) => {
      setLoading(true);
      setError(null);
      const result = await authService.signUpParent(
        form.email,
        form.password,
        form.username
      );
      setLoading(false);
      if (result.error) {
        setError(result.error.message);
        return false;
      }
      setUser(result.data!);
      return true;
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const signOut = useCallback(async () => {
    setLoading(true);
    await authService.signOut();
    storeLogout();
    setLoading(false);
  }, [storeLogout, setLoading]);

  const updatePassword = useCallback(async (newPassword: string) => {
    return authService.updatePassword(newPassword);
  }, []);

  const deleteAccount = useCallback(async () => {
    const result = await authService.deleteOwnAccount();
    if (!result.error) {
      storeLogout();
    }
    return result;
  }, [storeLogout]);

  return { signIn, signUp, signOut, updatePassword, deleteAccount };
}
