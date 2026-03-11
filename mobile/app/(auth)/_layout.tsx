import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="consent" />
      <Stack.Screen
        name="reset-password"
        options={{ presentation: 'modal', title: 'Mot de passe oublié' }}
      />
    </Stack>
  );
}
