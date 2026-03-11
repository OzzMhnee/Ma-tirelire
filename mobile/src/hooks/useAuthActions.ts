import { useCallback } from 'react';
import { router } from 'expo-router';
import { authService } from '@services/auth.service';
import { useAuthStore } from '@store/authStore';
import type { LoginForm, SignUpForm } from '@utils/validators';

/**
 * Hook centralisé pour toutes les actions d'authentification.
 * Les écrans ne doivent jamais appeler authService directement.
 */
export function useAuthActions() {
  const { setUser, setLoading, setError, logout: storeLogout } = useAuthStore();

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
      router.replace('/(parent)/dashboard');
      return true;
    },
    [setUser, setLoading, setError]
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
      router.replace('/(parent)/dashboard');
      return true;
    },
    [setUser, setLoading, setError]
  );

  const signOut = useCallback(async () => {
    setLoading(true);
    await authService.signOut();
    storeLogout();
    setLoading(false);
    router.replace('/(auth)/login');
  }, [storeLogout, setLoading]);

  return { signIn, signUp, signOut };
}
