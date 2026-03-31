import React, { useState } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyContent } from '@/core/components';
import { Button, ButtonIcon, ButtonText, theme } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner-native';
import Loader from '@/components/Loader';
import { router } from 'expo-router';
import ExpenseCard from './ExpenseCard';
import { deleteExpenseMutation, useExpenses } from '../hooks/useExpenses';

const ExpensesList = () => {
  const inset = useSafeAreaInsets();
  const { t } = useTranslation();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { expensesQuery, loadNextPage } = useExpenses();

  const { data, isPending, isError, error, refetch, isRefetching } =
    expensesQuery;

  const deleteExpense = deleteExpenseMutation();

  const onDelete = async (expenseId: string) => {
    setDeletingId(expenseId);
    await deleteExpense.mutateAsync(expenseId, {
      onSuccess: () => {
        toast.success(t('deleteSuccess'));
        setDeletingId(null);
      },
      onError: (error) => {
        toast.error(t('canNotDelete'));
        setDeletingId(null);
      },
    });
  };

  if (isError) {
    return (
      <EmptyContent
        title={t('loadError')}
        subtitle={error?.response?.data.message || error?.message}
        action={
          <Button onPress={() => refetch()}>
            <ButtonIcon name="refresh" />
            <ButtonText>{t('retry')}</ButtonText>
          </Button>
        }
      />
    );
  }

  if (isPending) return <Loader />;

  const expenses = data?.pages.flat() || [];

  if (!expenses || expenses.length === 0) {
    return (
      <EmptyContent
        title={t('noExpensesTitle')}
        subtitle={t('noExpensesSubtitle')}
        action={
          <Button onPress={() => router.push('/(app)/expenses/create')}>
            <ButtonIcon name="add-circle-outline" />
            <ButtonText>{t('createExpense')}</ButtonText>
          </Button>
        }
      />
    );
  }

  return (
    <FlatList
      data={expenses}
      renderItem={({ item }) => (
        <ExpenseCard
          expense={item}
          isLoading={deletingId === item.id}
          handleDelete={onDelete}
        />
      )}
      contentContainerStyle={{
        paddingVertical: 8,
        paddingBottom: inset.bottom,
        gap: 10,
        paddingHorizontal: 10,
      }}
      keyExtractor={(item) => item.id}
      onEndReached={() => loadNextPage()}
      onEndReachedThreshold={0.8}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={() => refetch()}
          tintColor={theme.primary}
        />
      }
    />
  );
};

export default ExpensesList;
