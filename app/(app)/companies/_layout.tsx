import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function CompaniesLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerShown: false, // Usar CustomHeader personalizado
      }}
    >
      <Stack.Screen name="index" options={{ title: t('myCompanies') }} />
      <Stack.Screen name="create" options={{ title: t('newCompany') }} />
      <Stack.Screen name="[id]" options={{ title: t('companyDetails') }} />
    </Stack>
  );
}
