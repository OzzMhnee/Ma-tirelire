import '../src/i18n/config';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { ThemeProvider } from '@/theme/ThemeProvider';
import * as SplashScreen from 'expo-splash-screen';
import { useSession } from '@hooks/useSession';
import { useAuthStore } from '@store/authStore';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useSession();
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    // Déclenche la réhydratation du store persist APRÈS le montage,
    // pour éviter que setState() soit appelé pendant useSyncExternalStore
    // (boucle infinie React 19 + Zustand v5 + localStorage synchrone sur web)
    useAuthStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(parent)" />
        <Stack.Screen name="(child)" />
      </Stack>
    </ThemeProvider>
  );
}
