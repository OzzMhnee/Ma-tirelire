import { Tabs, Redirect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ChildrenTabButton } from '@components/parent/ChildrenTabButton';
import { useAuthStore } from '@store/authStore';
import { THEMES } from '@constants/colors';

export default function ParentLayout() {
  const { t } = useTranslation();
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
        options={{ title: t('tabs.home'), tabBarIcon: () => null }}
      />
      <Tabs.Screen
        name="children/index"
        options={{
          title: t('tabs.children'),
          tabBarIcon: () => null,
          tabBarButton: (props) => <ChildrenTabButton accessibilityState={props.accessibilityState} />,
        }}
      />
      <Tabs.Screen
        name="missions/index"
        options={{ title: t('tabs.missions'), tabBarIcon: () => null }}
      />
      <Tabs.Screen
        name="account/index"
        options={{ title: t('tabs.parentAccount'), tabBarIcon: () => null }}
      />
      <Tabs.Screen name="children/new" options={{ href: null }} />
      <Tabs.Screen name="children/[id]" options={{ href: null }} />
      <Tabs.Screen name="children/[id]/edit" options={{ href: null }} />
      <Tabs.Screen name="missions/new" options={{ href: null }} />
      <Tabs.Screen name="missions/[id]/validate" options={{ href: null }} />
      <Tabs.Screen name="transactions/index" options={{ href: null }} />
    </Tabs>
  );
}
