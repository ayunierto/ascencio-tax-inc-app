import React, { useState } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner-native';
import { router } from 'expo-router';

import { useClients, deleteClientMutation } from '../hooks';
import { ClientCard } from './ClientCard';
import { EmptyContent } from '@/core/components';
import { Button, ButtonIcon, ButtonText, theme } from '@/components/ui';
import Loader from '@/components/Loader';

export const ClientsList = () => {
  const inset = useSafeAreaInsets();
  const { t } = useTranslation();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    data: clients,
    isPending,
    isError,
    error,
    refetch,
    isRefetching,
  } = useClients();

  const { mutateAsync: deleteClient } = deleteClientMutation();

  const onDelete = async (clientId: string) => {
    setDeletingId(clientId);
    await deleteClient(clientId, {
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

  if (!clients || clients.items.length === 0) {
    return (
      <EmptyContent
        title={t('noClientsTitle')}
        subtitle={t('noClientsSubtitle')}
        action={
          <Button onPress={() => router.push('/(app)/clients/create')}>
            <ButtonIcon name="add-circle-outline" />
            <ButtonText>{t('createClient')}</ButtonText>
          </Button>
        }
      />
    );
  }

  return (
    <FlatList
      data={clients.items}
      renderItem={({ item }) => (
        <ClientCard
          client={item}
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
