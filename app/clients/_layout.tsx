import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function ClientsLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerShown: false, // Usar CustomHeader personalizado
      }}
    >
      <Stack.Screen name="index" options={{ title: t('myClients') }} />
      <Stack.Screen name="create" options={{ title: t('newClient') }} />
      <Stack.Screen name="[id]" options={{ title: t('clientDetails') }} />
    </Stack>
  );
}
