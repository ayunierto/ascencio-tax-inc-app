import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function ExpensesLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerShown: false, // Usar CustomHeader personalizado
      }}
    >
      <Stack.Screen name="index" options={{ title: t('myExpenses') }} />
      <Stack.Screen name="create" options={{ title: t('newExpense') }} />
      <Stack.Screen name="[id]" options={{ title: t('expenseDetails') }} />
      <Stack.Screen name="scan" options={{ title: t('scanReceipt') }} />
    </Stack>
  );
}
