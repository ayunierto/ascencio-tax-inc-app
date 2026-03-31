import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Card, CardContent, theme } from '@/components/ui';
import { ThemedText } from '@/components/ui/ThemedText';
import { Button, ButtonIcon } from '@/components/ui/Button';
import { DeleteConfirmationDialog } from '@/core/components';
import { useExpenseCard } from '@/core/accounting/expenses/hooks/useExpenseCard';
import { ExpenseResponse } from '@/core/accounting/expenses/interfaces';

interface ExpenseCardProps {
  expense: ExpenseResponse;
  isLoading: boolean;
  handleDelete: (expenseId: string) => void;
}

const ExpenseCard = ({
  expense,
  isLoading,
  handleDelete,
}: ExpenseCardProps) => {
  const { t } = useTranslation();
  const { dateToLocaleDateTimeString } = useExpenseCard();

  return (
    <TouchableOpacity
      onPress={() => router.push(`/(app)/expenses/${expense.id}`)}
      disabled={isLoading}
      activeOpacity={0.7}
    >
      <Card>
        <CardContent style={styles.cardContent}>
          <View style={{ flex: 1 }}>
            <ThemedText
              numberOfLines={1}
              style={{ fontWeight: 'bold', marginBottom: 4 }}
            >
              {expense.merchant}
            </ThemedText>

            <ThemedText style={styles.subtitle} numberOfLines={1}>
              {t('date')}: {dateToLocaleDateTimeString(expense.date)}
            </ThemedText>

            <ThemedText style={styles.subtitle}>
              {t('total')}: ${expense.total}
            </ThemedText>
          </View>

          <DeleteConfirmationDialog onDelete={() => handleDelete(expense.id)}>
            <Button variant="ghost" disabled={isLoading} isLoading={isLoading}>
              <ButtonIcon
                name="trash-outline"
                style={{ color: theme.destructive }}
              />
            </Button>
          </DeleteConfirmationDialog>
        </CardContent>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subtitle: { color: theme.muted, fontSize: 12 },
});

export default ExpenseCard;
