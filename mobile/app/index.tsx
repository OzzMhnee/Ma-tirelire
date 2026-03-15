import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function Index() {
  const isLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);
  const activeChild = useAuthStore((s) => s.activeChild);
  const role = useAuthStore((s) => s.role);

  // Attendre la fin de l'hydratation avant de rediriger
  if (isLoading) return null;

  // Mode enfant autonome (connexion enfant sans session parent)
  if (!user && activeChild && role === 'child') {
    return <Redirect href="/(child)/dashboard" />;
  }

  return user
    ? <Redirect href="/(parent)/dashboard" />
    : <Redirect href="/(auth)/login" />;
}
