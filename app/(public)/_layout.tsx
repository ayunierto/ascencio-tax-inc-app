import { theme } from '@/components/ui';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function PublicLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Back',
        headerStyle: { backgroundColor: 'transparent' },
        headerTitleStyle: { color: theme.foreground },
        headerTintColor: theme.foreground,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="services" options={{ title: '' }} />
      <Stack.Screen name="pricing" options={{ title: t('pricing') }} />
      <Stack.Screen name="about" options={{ title: '' }} />
      <Stack.Screen name="contact" options={{ title: t('contactPageTitle') }} />
    </Stack>
  );
}
