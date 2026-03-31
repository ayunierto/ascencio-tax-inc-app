import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function ServicesLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerShown: false, // Usar CustomHeader personalizado
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: t('services'),
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: t('serviceDetails'),
        }}
      />
    </Stack>
  );
}
