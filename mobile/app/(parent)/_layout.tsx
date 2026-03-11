import { Tabs, Redirect } from 'expo-router';
import { useAuthStore } from '@store/authStore';
import { THEMES } from '@constants/colors';

export default function ParentLayout() {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Redirect href="/(auth)/login" />;

  const theme = THEMES.light;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.muted,
        tabBarStyle: { backgroundColor: theme.surface },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{ title: 'Accueil', tabBarIcon: () => null }}
      />
      <Tabs.Screen
        name="children/index"
        options={{ title: 'Enfants', tabBarIcon: () => null }}
      />
      <Tabs.Screen
        name="missions/index"
        options={{ title: 'Missions', tabBarIcon: () => null }}
      />
      <Tabs.Screen
        name="transactions/index"
        options={{ title: 'Historique', tabBarIcon: () => null }}
      />
    </Tabs>
  );
}
