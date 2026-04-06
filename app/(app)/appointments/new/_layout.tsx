import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { theme } from '@/components/ui/theme';

export default function NewAppointmentLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTitleAlign: 'center',
        headerTintColor: theme.foreground,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name='availability'
        options={{
          title: t('selectDateTime'),
        }}
      />
      <Stack.Screen
        name='details'
        options={{
          title: t('additionalDetails'),
        }}
      />
      <Stack.Screen
        name='summary'
        options={{
          title: t('confirmBooking'),
        }}
      />
    </Stack>
  );
}
