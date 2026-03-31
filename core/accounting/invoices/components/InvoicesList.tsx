import React, { useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { useInvoices, useDeleteInvoiceMutation } from '../hooks';
import { InvoiceCard } from './InvoiceCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyContent } from '@/core/components';
import { Button, ButtonIcon, ButtonText, theme } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner-native';
import Loader from '@/components/Loader';
import { router } from 'expo-router';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/Select';
import { ThemedText } from '@/components/ui/ThemedText';

export const InvoicesList = () => {
  const inset = useSafeAreaInsets();
  const { t } = useTranslation();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const {
    data: invoices,
    isPending,
    isError,
    error,
    refetch,
    isRefetching,
  } = useInvoices(filterStatus);

  const { mutateAsync: deleteInvoice } = useDeleteInvoiceMutation();

  const onDelete = async (invoiceId: string) => {
    setDeletingId(invoiceId);
    await deleteInvoice(invoiceId, {
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

  // Calculate stats
  const stats = {
    total: invoices?.items.length ?? 0,
    totalAmount:
      invoices?.items.reduce((sum, inv) => sum + Number(inv.total), 0) ?? 0,
    pending:
      invoices?.items.filter(
        (i) => i.status === 'draft' || i.status === 'issued'
      ).length ?? 0,
    paid: invoices?.items.filter((i) => i.status === 'paid').length ?? 0,
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

  return (
    <View style={{ flex: 1 }}>
      {/* Stats Summary */}
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 10,
          paddingVertical: 8,
          gap: 8,
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: theme.card,
            borderRadius: 8,
            padding: 12,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <ThemedText style={{ color: theme.muted, fontSize: 11 }}>
            {t('totalInvoices')}
          </ThemedText>
          <ThemedText style={{ fontWeight: 'bold', fontSize: 18 }}>
            {stats.total}
          </ThemedText>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: theme.card,
            borderRadius: 8,
            padding: 12,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <ThemedText style={{ color: theme.muted, fontSize: 11 }}>
            {t('pending')}
          </ThemedText>
          <ThemedText style={{ fontWeight: 'bold', fontSize: 18 }}>
            {stats.pending}
          </ThemedText>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: theme.card,
            borderRadius: 8,
            padding: 12,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <ThemedText style={{ color: theme.muted, fontSize: 11 }}>
            {t('totalAmount')}
          </ThemedText>
          <ThemedText
            style={{
              fontWeight: 'bold',
              fontSize: 14,
              fontFamily: 'monospace',
            }}
          >
            ${stats.totalAmount.toFixed(2)}
          </ThemedText>
        </View>
      </View>

      {/* Filter */}
      <View
        style={{
          paddingHorizontal: 10,
          paddingBottom: 8,
        }}
      >
        <Select
          value={filterStatus}
          onValueChange={setFilterStatus}
          options={[
            { label: t('allStatuses'), value: 'all' },
            { label: t('pending'), value: 'pending' },
            { label: t('paid'), value: 'paid' },
            { label: t('overdue'), value: 'overdue' },
            { label: t('canceled'), value: 'canceled' },
          ]}
        >
          <SelectTrigger placeholder={t('filterByStatus')} />
          <SelectContent>
            <SelectItem label={t('allStatuses')} value="all" />
            <SelectItem label={t('pending')} value="pending" />
            <SelectItem label={t('paid')} value="paid" />
            <SelectItem label={t('overdue')} value="overdue" />
            <SelectItem label={t('canceled')} value="canceled" />
          </SelectContent>
        </Select>
      </View>

      {!invoices || invoices.items.length === 0 ? (
        <EmptyContent
          title={t('noInvoicesTitle')}
          subtitle={t('noInvoicesSubtitle')}
          action={
            <Button onPress={() => router.push('/(app)/invoices/create')}>
              <ButtonIcon name="add-circle-outline" />
              <ButtonText>{t('createInvoice')}</ButtonText>
            </Button>
          }
        />
      ) : (
        <FlatList
          data={invoices.items}
          renderItem={({ item }) => (
            <InvoiceCard
              invoice={item}
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
      )}
    </View>
  );
};
