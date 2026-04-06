import React from 'react';
import { View } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { theme, CustomHeader, HeaderButton } from '@/components/ui';
import ExpensesList from '@/core/accounting/expenses/components/ExpensesList';

export default function ExpensesTabScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();

  return (
    <View style={{ flex: 1 }}>
      <CustomHeader
        title={t('myExpenses')}
        left={
          <HeaderButton
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          >
            <Ionicons name='menu' size={24} color='#ffffff' />
          </HeaderButton>
        }
        right={
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <HeaderButton onPress={() => router.push('/(app)/expenses/create')}>
              <Ionicons
                name='add-circle-outline'
                size={24}
                color={theme.primary}
              />
            </HeaderButton>
            <HeaderButton
              onPress={() =>
                router.push({
                  pathname: '/(app)/expenses/create',
                  params: { openCamera: '1' },
                })
              }
            >
              <Ionicons name='camera-outline' size={24} color={theme.primary} />
            </HeaderButton>
          </View>
        }
      />
      <ExpensesList />
    </View>
  );
}
