import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function ProfileLayout() {
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
          title: t('settings'),
        }}
      />

      <Stack.Screen
        name="account"
        options={{
          title: t('myAccount'),
        }}
      />

      <Stack.Screen
        name="delete-account"
        options={{
          title: t('deleteAccount'),
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
