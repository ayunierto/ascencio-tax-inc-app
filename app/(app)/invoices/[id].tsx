import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme, HeaderButton } from '@/components/ui';
import { InvoiceForm, useInvoice } from '@/core/accounting/invoices';
import Loader from '@/components/Loader';
import { EmptyContent } from '@/core/components';

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: invoice, isPending, isError, error } = useInvoice(id!);

  if (isPending) return <Loader />;

  if (isError) {
    return (
      <EmptyContent
        title="Error loading invoice"
        subtitle={error?.message || 'Unknown error'}
        icon="alert-circle-outline"
      />
    );
  }

  if (!invoice) {
    return (
      <EmptyContent
        title="Invoice not found"
        subtitle="The invoice you're looking for doesn't exist"
        icon="document-text-outline"
      />
    );
  }

  const headerLeft = (
    <HeaderButton onPress={() => router.back()}>
      <Ionicons name="arrow-back" size={24} color="#ffffff" />
    </HeaderButton>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <InvoiceForm invoice={invoice} headerLeft={headerLeft} />
    </View>
  );
}
