import React, { useState } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { useEmployees, useDeleteEmployeeMutation } from '../hooks';
import { EmployeeCard } from './EmployeeCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyContent } from '@/core/components';
import { Button, ButtonIcon, ButtonText, theme } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner-native';
import Loader from '@/components/Loader';
import { router } from 'expo-router';

interface EmployeesListProps {
  companyId?: string;
}

export const EmployeesList = ({ companyId }: EmployeesListProps) => {
  const inset = useSafeAreaInsets();
  const { t } = useTranslation();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    data: employees,
    isPending,
    isError,
    error,
    refetch,
    isRefetching,
  } = useEmployees(companyId);

  const { mutateAsync: deleteEmployee } = useDeleteEmployeeMutation();

  const onDelete = async (employeeId: string) => {
    setDeletingId(employeeId);
    await deleteEmployee(employeeId, {
      onSuccess: () => {
        toast.success(t('deleteSuccess'));
        setDeletingId(null);
      },
      onError: () => {
        toast.error(t('canNotDelete'));
        setDeletingId(null);
      },
    });
  };

  if (isError) {
    return (
      <EmptyContent
        title="loadError"
        subtitle={error?.response?.data.message || error?.message}
        action={
          <Button onPress={() => refetch()}>
            <ButtonIcon name="refresh" />
          </Button>
        }
      />
    );
  }

  if (isPending) return <Loader />;

  if (!employees || employees.items.length === 0) {
    return (
      <EmptyContent
        title={t('noEmployeesTitle')}
        subtitle={t('noEmployeesSubtitle')}
        action={
          <Button
            // TODO: Create employees route structure under app/(app)/employees/create
            // onPress={() => router.push('/(app)/employees/create')}
            disabled
          >
            <ButtonIcon name="add-circle-outline" />
            <ButtonText>{t('createEmployee')}</ButtonText>
          </Button>
        }
      />
    );
  }

  return (
    <FlatList
      data={employees.items}
      renderItem={({ item }) => (
        <EmployeeCard
          employee={item}
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
