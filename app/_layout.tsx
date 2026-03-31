import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
// ⚠️ TEMPORARY: Commented out for testing
// import { useEffect } from 'react';
// import { Platform } from 'react-native';
// import Purchases from 'react-native-purchases';

import { CustomTheme } from '@/theme/CustomTheme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Toaster } from 'sonner-native';
import { SubscriptionProvider } from '@/core/subscription/SubscriptionContext';

import '../i18n';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Valores por defecto conservadores
      staleTime: 0,
      gcTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

export const unstable_settings = {
  // This is needed when using file-based routing with (group) syntax
  initialRouteName: 'index',
};

// ⚠️ TEMPORARY: Commented out for testing
// TODO: Replace with your actual RevenueCat API keys from the dashboard
// const REVENUE_CAT_IOS_KEY = 'appl_YOUR_IOS_KEY_HERE';
// const REVENUE_CAT_ANDROID_KEY = 'goog_YOUR_ANDROID_KEY_HERE';

export default function RootLayout() {
  // ⚠️ TEMPORARY: Commented out for testing - RevenueCat initialization disabled
  // useEffect(() => {
  //   // Initialize RevenueCat
  //   if (Platform.OS === 'ios') {
  //     Purchases.configure({ apiKey: REVENUE_CAT_IOS_KEY });
  //   } else if (Platform.OS === 'android') {
  //     Purchases.configure({ apiKey: REVENUE_CAT_ANDROID_KEY });
  //   }

  //   // Optional: Set log level for debugging
  //   // Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  // }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SubscriptionProvider>
          <ThemeProvider value={CustomTheme}>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            >
              {/* Root index - handles initial routing logic */}
              <Stack.Screen name="index" options={{ headerShown: false }} />

              {/* Auth routes - accessible without authentication */}
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />

              {/* Public routes - accessible without authentication */}
              <Stack.Screen name="(public)" options={{ headerShown: false }} />

              {/* Protected routes - requires authentication */}
              <Stack.Screen name="(app)" options={{ headerShown: false }} />
            </Stack>

            <StatusBar style="light" />

            <Toast />
            <Toaster />
          </ThemeProvider>
        </SubscriptionProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
