import React from 'react';
import { View } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { theme, CustomHeader, HeaderButton } from '@/components/ui';
import { ClientsList } from '@/core/accounting/clients/components';

const ClientsScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  return (
    <View style={{ flex: 1 }}>
      <CustomHeader
        title={t('myClients')}
        left={
          <HeaderButton
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          >
            <Ionicons name="menu" size={24} color="#ffffff" />
          </HeaderButton>
        }
        right={
          <HeaderButton onPress={() => router.push('/(app)/clients/create')}>
            <Ionicons
              name="add-circle-outline"
              size={24}
              color={theme.primary}
            />
          </HeaderButton>
        }
      />
      <ClientsList />
    </View>
  );
};

export default ClientsScreen;
