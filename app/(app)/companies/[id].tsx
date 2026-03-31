import { useEffect } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner-native';

import { CompanyForm } from '@/core/accounting/companies/components';
import { useCompany } from '@/core/accounting/companies/hooks';
import Loader from '@/components/Loader';
import { EmptyContent } from '@/core/components';
import { Button, ButtonIcon, ButtonText } from '@/components/ui';

const UpdateCompanyScreen = () => {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const {
    data: company,
    isPending,
    isError,
    error,
    refetch,
  } = useCompany(id || '');

  // Validar que el ID existe
  useEffect(() => {
    if (!id) {
      toast.error(t('invalidCompanyId'));
      router.replace('/(app)/companies');
    }
  }, [id, t]);

  if (isPending) {
    return <Loader />;
  }

  if (isError || !company) {
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
            <Button onPress={() => router.push('/(app)/companies')}>
              <ButtonIcon name="arrow-back" />
              <ButtonText>{t('goBack')}</ButtonText>
            </Button>

            <Button onPress={refetch} style={{ marginTop: 8 }}>
              <ButtonIcon name="refresh" />
              <ButtonText>{t('retry')}</ButtonText>
            </Button>
          </View>
        }
        // onBack={() => router.back()}
      />
    );
  }

  return <CompanyForm company={company} />;
};

export default UpdateCompanyScreen;
