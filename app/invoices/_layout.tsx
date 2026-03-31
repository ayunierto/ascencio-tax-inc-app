import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function InvoicesLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerShown: false, // Ocultar header nativo, usar CustomHeader
      }}
    >
      <Stack.Screen name="index" options={{ title: t('myInvoices') }} />
      <Stack.Screen name="create" options={{ title: t('newInvoice') }} />
      <Stack.Screen name="[id]" options={{ title: t('invoiceDetails') }} />
    </Stack>
  );
}
