import { Redirect } from 'expo-router';
import { Drawer } from 'expo-router/drawer';

import { useAuthStore } from '@/core/auth/store/useAuthStore';
import { theme } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Loader from '@/components/Loader';
import { useCheckAppVersion } from '@/core/hooks/useCheckAppVersion';

export default function AppLayout() {
  const { user, authStatus } = useAuthStore();
  const { checking: isCheckingAppVersion, updateRequired } =
    useCheckAppVersion();
  const { t } = useTranslation();

  // Show loading while checking auth
  if (authStatus === 'loading' || isCheckingAppVersion || updateRequired)
    return <Loader />;

  // Redirect to login if not authenticated
  if (authStatus !== 'authenticated' || !user) {
    return <Redirect href="/login" />;
  }

  return (
    <Drawer
      screenOptions={{
        drawerStyle: { backgroundColor: theme.background },
        drawerActiveTintColor: theme.primary,
        headerStyle: { backgroundColor: theme.background },
        headerTitleStyle: { color: theme.foreground },
        headerShown: false,
        drawerLabelStyle: { color: theme.foreground },
      }}
    >
      <Drawer.Screen
        name="(dashboard)/index"
        options={{
          drawerLabel: t('dashboard'),
          title: t('dashboard'),
          drawerIcon: (props) => (
            <Ionicons
              name={props.focused ? 'grid' : 'grid-outline'}
              size={props.size}
              color={theme.foreground}
            />
          ),
        }}
      />

      <Drawer.Screen
        name="companies"
        options={{
          drawerLabel: t('companies'),
          title: t('companies'),
          drawerIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'business' : 'business-outline'}
              size={size}
              color={theme.foreground}
            />
          ),
        }}
      />

      <Drawer.Screen
        name="clients"
        options={{
          drawerLabel: t('myClients'),
          title: t('myClients'),
          drawerIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'people' : 'people-outline'}
              size={size}
              color={theme.foreground}
            />
          ),
        }}
      />

      <Drawer.Screen
        name="expenses"
        options={{
          drawerLabel: t('expenses'),
          title: t('expenses'),
          drawerIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'cash' : 'cash-outline'}
              size={size}
              color={theme.foreground}
            />
          ),
        }}
      />

      <Drawer.Screen
        name="invoices"
        options={{
          drawerLabel: t('invoices'),
          title: t('invoices'),
          drawerIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'document' : 'document-outline'}
              size={size}
              color={theme.foreground}
            />
          ),
        }}
      />

      <Drawer.Screen
        name="appointments"
        options={{
          headerShown: false,
          drawerLabel: t('myAppointments'),
          title: t('myAppointments'),
          drawerIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'calendar' : 'calendar-outline'}
              size={size}
              color={theme.foreground}
            />
          ),
        }}
      />

      <Drawer.Screen
        name="services"
        options={{
          drawerLabel: t('services'),
          title: t('services'),
          drawerIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'briefcase' : 'briefcase-outline'}
              size={size}
              color={theme.foreground}
            />
          ),
        }}
      />

      <Drawer.Screen
        name="reports"
        options={{
          drawerLabel: t('reports'),
          title: t('reports'),
          drawerIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'bar-chart' : 'bar-chart-outline'}
              size={size}
              color={theme.foreground}
            />
          ),
        }}
      />

      {/* <Drawer.Screen
        name="subscription"
        options={{
          headerShown: true,
          drawerLabel: t('subscription'),
          title: t('subscription'),
          drawerIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'card' : 'card-outline'}
              size={size}
              color={theme.foreground}
            />
          ),
        }}
      /> */}

      <Drawer.Screen
        name="settings"
        options={{
          drawerLabel: t('settings'),
          title: t('settings'),
          drawerIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'settings' : 'settings-outline'}
              size={size}
              color={theme.foreground}
            />
          ),
        }}
      />
    </Drawer>
  );
}
