import { Stack, Redirect } from 'expo-router';
import { useAuthStore } from '@store/authStore';

export default function ChildLayout() {
  const user = useAuthStore((s) => s.user);
  const activeChild = useAuthStore((s) => s.activeChild);
  // Autoriser l'accès si session parent OU connexion enfant autonome
  if (!user && !activeChild) return <Redirect href="/(auth)/login" />;
  if (!activeChild) return <Redirect href="/(parent)/children/index" />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="missions" />
      <Stack.Screen name="wishlist/index" />
      <Stack.Screen name="wishlist/new" />
    </Stack>
  );
}
