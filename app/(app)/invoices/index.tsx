import React from 'react';
import { View } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { theme, CustomHeader, HeaderButton } from '@/components/ui';
import { InvoicesList } from '@/core/accounting/invoices';
// ⚠️ TEMPORARY: Commented out for testing
// import { PremiumGuard } from '@/core/subscription';
// import { PremiumFeature } from '@ascencio/shared';
// import { TrialBanner } from '@/components/subscription/TrialBanner';

export default function InvoicesIndexScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();

  return (
    <View style={{ flex: 1 }}>
      <CustomHeader
        title={t('myInvoices')}
        left={
          <HeaderButton
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          >
            <Ionicons name="menu" size={24} color="#ffffff" />
          </HeaderButton>
        }
        right={
          <HeaderButton onPress={() => router.push('/(app)/invoices/create')}>
            <Ionicons
              name="add-circle-outline"
              size={24}
              color={theme.primary}
            />
          </HeaderButton>
        }
      />
      {/* ⚠️ TEMPORARY: Commented out for testing */}
      {/* <TrialBanner
        feature={PremiumFeature.INVOICES}
        style={{ marginHorizontal: 16, marginTop: 8 }}
      /> */}
      <InvoicesList />
    </View>
  );
}
