import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function ReportsLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerShown: false, // Usar CustomHeader personalizado
      }}
    >
      <Stack.Screen name="index" options={{ title: t('reports') }} />
    </Stack>
  );
}
