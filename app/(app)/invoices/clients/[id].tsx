import { useLocalSearchParams, router } from 'expo-router';
import { ClientForm } from '@/core/accounting/clients/components';
import { useClient } from '@/core/accounting/clients/hooks';
import Loader from '@/components/Loader';
import { useEffect } from 'react';
import { toast } from 'sonner-native';
import { useTranslation } from 'react-i18next';
import { EmptyContent } from '@/core/components';
import { Button, ButtonIcon, ButtonText } from '@/components/ui';
import { View } from 'react-native';
import { mapNullToUndefined } from '@/utils';

const UpdateClientScreen = () => {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const {
    data: client,
    isPending,
    isError,
    error,
    refetch,
  } = useClient(id || '');

  useEffect(() => {
    if (!id) {
      toast.error(t('invalidClientId'));
      router.replace('/(app)/invoices/(tabs)/clients');
    }
  }, [id, t]);

  if (isPending) {
    return <Loader />;
  }

  if (isError || !client) {
    return (
      <EmptyContent
        title={t('loadError')}
        subtitle={
          error?.response?.data?.message ||
          error?.message ||
          t('resourceNotFound')
        }
        action={
          <View style={{ marginTop: 16, flexDirection: 'row', gap: 8 }}>
            <Button
              onPress={() => router.push('/(app)/invoices/(tabs)/clients')}
            >
              <ButtonIcon name='arrow-back' />
              <ButtonText>{t('goBack')}</ButtonText>
            </Button>

            <Button onPress={refetch} style={{ marginTop: 8 }}>
              <ButtonIcon name='refresh' />
              <ButtonText>{t('retry')}</ButtonText>
            </Button>
          </View>
        }
      />
    );
  }

  const clientMapped = mapNullToUndefined(client);

  return <ClientForm client={clientMapped} />;
};

export default UpdateClientScreen;
