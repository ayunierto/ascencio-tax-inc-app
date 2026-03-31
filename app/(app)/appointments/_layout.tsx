import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function AppointmentsLayout() {
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
          title: t('myAppointments'),
        }}
      />
      <Stack.Screen
        name="past"
        options={{
          title: t('pastAppointments'),
        }}
      />
      <Stack.Screen
        name="new"
        options={{
          title: t('newAppointment'),
        }}
      />
    </Stack>
  );
}
