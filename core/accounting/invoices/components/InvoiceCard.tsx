import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { DateTime } from 'luxon';

import { Card, CardContent, theme } from '@/components/ui';
import { Invoice, InvoiceStatus } from '@ascencio/shared/interfaces';
import { ThemedText } from '@/components/ui/ThemedText';
import { Button, ButtonIcon } from '@/components/ui/Button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/AlertDialog';
import { Ionicons } from '@expo/vector-icons';

interface InvoiceCardProps {
  invoice: Invoice;
  isLoading: boolean;
  handleDelete: (invoiceId: string) => void;
}

const getStatusColor = (status: InvoiceStatus) => {
  switch (status) {
    case 'paid':
      return theme.success;
    case 'draft':
      return '#9ca3af'; // gray
    case 'issued':
      return '#3b82f6'; // blue
    case 'partial':
      return '#f59e0b'; // warning/orange
    case 'overdue':
      return theme.destructive;
    case 'canceled':
    case 'void':
      return theme.muted;
    default:
      return theme.muted;
  }
};

const getStatusLabel = (status: InvoiceStatus, t: (key: string) => string) => {
  switch (status) {
    case 'paid':
      return t('paid');
    case 'draft':
      return t('draft');
    case 'issued':
      return t('issued');
    case 'partial':
      return t('partiallyPaid');
    case 'overdue':
      return t('overdue');
    case 'canceled':
      return t('canceled');
    case 'void':
      return t('void');
    default:
      return status;
  }
};

export const InvoiceCard = ({
  invoice,
  isLoading,
  handleDelete,
}: InvoiceCardProps) => {
  const { t } = useTranslation();
  const statusColor = getStatusColor(invoice.status);

  const getBillToName = () => {
    if (invoice.billToClient) {
      return invoice.billToClient.fullName;
    }
    return t('noRecipient');
  };

  return (
    <TouchableOpacity
      onPress={() => router.push(`/(app)/invoices/${invoice.id}`)}
      disabled={isLoading}
      activeOpacity={0.7}
    >
      <Card>
        <CardContent style={styles.cardContent}>
          <View style={styles.mainContent}>
            <View style={styles.header}>
              <View style={styles.invoiceInfo}>
                <ThemedText style={styles.invoiceNumber}>
                  #{invoice.invoiceNumber}
                </ThemedText>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusColor + '20' },
                  ]}
                >
                  <ThemedText
                    style={[styles.statusText, { color: statusColor }]}
                  >
                    {getStatusLabel(invoice.status, t)}
                  </ThemedText>
                </View>
              </View>
              <ThemedText style={styles.total}>
                CA${Number(invoice.total).toFixed(2)}
              </ThemedText>
            </View>

            <View style={styles.billTo}>
              <Ionicons name="person-outline" size={14} color={theme.muted} />
              <ThemedText style={styles.billToText} numberOfLines={1}>
                {getBillToName()}
              </ThemedText>
            </View>

            <View style={styles.dates}>
              <ThemedText style={styles.dateText}>
                {t('issued')}:{' '}
                {DateTime.fromISO(invoice.issueDate).toFormat('MMM d, yyyy')}
              </ThemedText>
              <ThemedText style={styles.dateText}>
                {t('due')}:{' '}
                {DateTime.fromISO(invoice.dueDate).toFormat('MMM d, yyyy')}
              </ThemedText>
            </View>

            {invoice.balanceDue > 0 && (
              <ThemedText style={styles.balanceDue}>
                {t('balanceDue')}: CA${Number(invoice.balanceDue).toFixed(2)}
              </ThemedText>
            )}
          </View>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                disabled={isLoading}
                isLoading={isLoading}
              >
                <ButtonIcon
                  name="trash-outline"
                  style={{ color: theme.destructive }}
                />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('areYouSure')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('thisActionCannotBeUndone')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                <AlertDialogAction onPress={() => handleDelete(invoice.id)}>
                  {t('delete')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  mainContent: {
    flex: 1,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  invoiceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  invoiceNumber: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  total: {
    fontWeight: 'bold',
    fontSize: 18,
    fontFamily: 'monospace',
  },
  billTo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  billToText: {
    color: theme.muted,
    fontSize: 13,
    flex: 1,
  },
  dates: {
    flexDirection: 'row',
    gap: 16,
  },
  dateText: {
    color: theme.muted,
    fontSize: 11,
  },
  balanceDue: {
    color: theme.destructive,
    fontSize: 12,
    fontWeight: '600',
  },
});
