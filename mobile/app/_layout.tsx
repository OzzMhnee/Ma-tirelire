import '../src/i18n/config';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import * as SplashScreen from 'expo-splash-screen';
import { useSession } from '@hooks/useSession';
import { useAuthStore } from '@store/authStore';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useSession();
  const { isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  return (
    <PaperProvider theme={MD3LightTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(parent)" />
        <Stack.Screen name="(child)" />
      </Stack>
    </PaperProvider>
  );
}
