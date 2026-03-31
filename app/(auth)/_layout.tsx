import React from 'react';
import { Stack } from 'expo-router';
import { theme } from '@/components/ui';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerShadowVisible: false,
        headerShown: false,
      }}
      initialRouteName="login"
    >
      <Stack.Screen
        name="forgot-password"
        options={{
          headerShown: true,
          title: '',
        }}
      />

      <Stack.Screen
        name="login"
        options={{
          title: '',
        }}
      />

      <Stack.Screen
        name="register"
        options={{
          title: '',
        }}
      />

      <Stack.Screen
        name="verify-email"
        options={{
          title: '',
          headerShown: true,
          headerBackVisible: false,
        }}
      />

      <Stack.Screen
        name="reset-password"
        options={{
          title: '',
          headerShown: true,
          headerBackVisible: false,
        }}
      />
    </Stack>
  );
}
