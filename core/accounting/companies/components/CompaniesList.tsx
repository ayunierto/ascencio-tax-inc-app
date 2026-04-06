import React, { useState } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { useCompanies, deleteCompanyMutation } from '../hooks';
import { CompanyCard } from './CompanyCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyContent } from '@/core/components';
import { Button, ButtonIcon, ButtonText, theme } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner-native';
import Loader from '@/components/Loader';
import { router } from 'expo-router';

export const CompaniesList = () => {
  const inset = useSafeAreaInsets();
  const { t } = useTranslation();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    data: companies,
    isPending,
    isError,
    error,
    refetch,
    isRefetching,
  } = useCompanies();

  const { mutateAsync: deleteCompany } = deleteCompanyMutation();

  const onDelete = async (companyId: string) => {
    setDeletingId(companyId);
    await deleteCompany(companyId, {
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
        title='loadError'
        subtitle={error?.response?.data.message || error?.message}
        action={
          <Button onPress={() => refetch()}>
            <ButtonIcon name='refresh' />
          </Button>
        }
      />
    );
  }

  if (isPending) return <Loader />;

  if (!companies || companies.items.length === 0) {
    return (
      <EmptyContent
        title={t('noCompaniesTitle')}
        subtitle={t('noCompaniesSubtitle')}
        action={
          <Button
            onPress={() => router.push('/(app)/invoices/companies/create')}
          >
            <ButtonIcon name='add-circle-outline' />
            <ButtonText>{t('createCompany')}</ButtonText>
          </Button>
        }
      />
    );
  }

  return (
    <FlatList
      data={companies.items}
      renderItem={({ item }) => (
        <CompanyCard
          company={item}
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
