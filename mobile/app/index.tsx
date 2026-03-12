import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function Index() {
  const isLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);

  // Attendre la fin de l'hydratation avant de rediriger
  if (isLoading) return null;

  return user
    ? <Redirect href="/(parent)/dashboard" />
    : <Redirect href="/(auth)/login" />;
}
