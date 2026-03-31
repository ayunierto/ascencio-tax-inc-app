import React from 'react';
import { View } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { theme, HeaderButton } from '@/components/ui';
import { InvoiceForm } from '@/core/accounting/invoices';
import { Invoice } from '@ascencio/shared/interfaces';

export default function CreateInvoiceScreen() {
  // Create an empty invoice template for the form
  const emptyInvoice: Invoice = {
    id: 'new',
    userId: '',
    fromCompanyId: '', // Required field
    invoiceNumber: '',
    invoiceYear: new Date().getFullYear(),
    billToClientId: '',
    issueDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    subtotal: 0,
    taxRate: 13,
    taxAmount: 0,
    total: 0,
    amountPaid: 0,
    balanceDue: 0,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lineItems: [],
  };

  const headerLeft = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <HeaderButton onPress={() => router.back()}>
        <Ionicons name='arrow-back' size={24} color='#ffffff' />
      </HeaderButton>
      {/* <HeaderButton
        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      >
        <Ionicons name="menu" size={24} color="#ffffff" />
      </HeaderButton> */}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <InvoiceForm invoice={emptyInvoice} headerLeft={headerLeft} />
    </View>
  );
}
