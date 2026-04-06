import React, { useState } from 'react';

import { FlatList, RefreshControl, View } from 'react-native';
import { router, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ServiceCard } from '@/components/home/ServiceCard';
import { ServiceListSkeleton } from '@/components/home/ServiceCardSkeleton';
import {
  theme,
  CustomHeader,
  HeaderButton,
  Input,
  Button,
  ButtonIcon,
} from '@/components/ui';
import { EmptyContent } from '@/core/components';
import { useServices } from '@/core/services/hooks/useServices';
import { Service } from '@ascencio/shared/interfaces';
import { DrawerActions } from '@react-navigation/native';

export default function AppointmentsServicesTabScreen() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();

  const {
    data: servicesResponse,
    isPending,
    isError,
    error,
    refetch,
    isRefetching,
  } = useServices();

  const selectService = (service: Service): void => {
    router.push({
      pathname: '/(app)/appointments/services/[id]',
      params: { id: service.id },
    });
  };

  const filteredServices = servicesResponse?.items.filter((service) =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (isError)
    return (
      <EmptyContent
        title={t('error')}
        subtitle={error.response?.data.message || error.message}
      />
    );

  if (isPending) return <ServiceListSkeleton />;

  if (!servicesResponse || servicesResponse.items.length === 0) {
    return (
      <EmptyContent
        title={t('noServicesTitle')}
        subtitle={t('noServicesSubtitle')}
        action={
          <Button onPress={refetch}>
            <ButtonIcon name='reload' />
            {t('retry')}
          </Button>
        }
      />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <CustomHeader
        title={t('services')}
        left={
          <HeaderButton
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          >
            <Ionicons name='menu' size={24} color='#ffffff' />
          </HeaderButton>
        }
      />
      <FlatList
        data={filteredServices}
        renderItem={({ item }) => (
          <ServiceCard
            key={item.id}
            service={item}
            selectService={selectService}
          />
        )}
        ListHeaderComponent={
          <Input
            placeholder={t('searchServices')}
            placeholderTextColor={theme.mutedForeground}
            value={searchQuery}
            onChangeText={setSearchQuery}
            leadingIcon='search-outline'
            clearable
            rootStyle={{ marginBottom: theme.gap }}
          />
        }
        ListEmptyComponent={
          <EmptyContent
            title={t('noResultsFound')}
            subtitle={t('tryAdjustingSearch')}
          />
        }
        contentContainerStyle={{
          padding: 10,
          paddingBottom: 40,
        }}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      />
    </View>
  );
}
