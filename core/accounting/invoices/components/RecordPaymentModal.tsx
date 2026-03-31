import React, { useEffect, useMemo } from 'react';
import { Modal, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

import {
  CreateInvoicePaymentRequest,
  createInvoicePaymentSchema,
  PaymentMethod,
} from '@ascencio/shared';
import { Input } from '@/components/ui/Input';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { theme, Button, ButtonText, Card, CardContent } from '@/components/ui';
import { ThemedText } from '@/components/ui/ThemedText';
import DateTimePicker from '@/components/ui/DateTimePicker/DateTimePicker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/Select';

interface RecordPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateInvoicePaymentRequest) => Promise<void>;
  remainingBalance: number;
  invoiceNumber?: string;
  isSubmitting?: boolean;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  visible,
  onClose,
  onSubmit,
  remainingBalance,
  invoiceNumber,
  isSubmitting = false,
}) => {
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CreateInvoicePaymentRequest>({
    resolver: zodResolver(createInvoicePaymentSchema) as any,
    defaultValues: {
      amount: remainingBalance,
      paidAt: new Date().toISOString().split('T')[0],
      method: 'cash',
      reference: '',
      note: '',
    },
  });

  const watchedAmount = watch('amount');

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      reset({
        amount: remainingBalance,
        paidAt: new Date().toISOString().split('T')[0],
        method: 'cash',
        reference: '',
        note: '',
      });
    }
  }, [visible, remainingBalance, reset]);

  const handleFormSubmit = async (data: CreateInvoicePaymentRequest) => {
    await onSubmit(data);
    reset();
  };

  // Payment methods options
  const paymentMethods: Array<{ label: string; value: PaymentMethod }> =
    useMemo(
      () => [
        { label: t('cash'), value: 'cash' },
        { label: t('check'), value: 'check' },
        { label: t('transfer'), value: 'transfer' },
        { label: t('credit_card'), value: 'credit_card' },
        { label: t('debit_card'), value: 'debit_card' },
        { label: t('other'), value: 'other' },
      ],
      [t],
    );

  // Validate amount
  const amountError = useMemo(() => {
    const amount =
      typeof watchedAmount === 'number'
        ? watchedAmount
        : parseFloat(String(watchedAmount) || '0');
    if (amount > remainingBalance) {
      return t('paymentExceedsBalance');
    }
    if (amount <= 0) {
      return t('invalidAmount');
    }
    return undefined;
  }, [watchedAmount, remainingBalance, t]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.background }}
        edges={['top', 'bottom']}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
            backgroundColor: theme.card,
          }}
        >
          <View style={{ flex: 1 }}>
            <ThemedText style={{ fontSize: 18, fontWeight: 'bold' }}>
              {t('recordPayment')}
            </ThemedText>
            {invoiceNumber && (
              <ThemedText style={{ fontSize: 14, color: theme.muted }}>
                {t('invoice')} #{invoiceNumber}
              </ThemedText>
            )}
          </View>
          <TouchableOpacity onPress={onClose} disabled={isSubmitting}>
            <Ionicons name="close" size={28} color={theme.foreground} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, gap: 16 }}
        >
          {/* Remaining Balance Info */}
          <Card>
            <CardContent style={{ padding: 16 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <ThemedText style={{ fontSize: 16, color: theme.muted }}>
                  {t('remainingBalance')}
                </ThemedText>
                <ThemedText
                  style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: theme.primary,
                  }}
                >
                  CA${remainingBalance.toFixed(2)}
                </ThemedText>
              </View>
            </CardContent>
          </Card>

          {/* Payment Amount */}
          <Controller
            control={control}
            name="amount"
            render={({ field: { onChange, value } }) => (
              <Input
                label={`${t('paymentAmount')} *`}
                value={value?.toString() || ''}
                onChangeText={(text) => {
                  const num = parseFloat(text);
                  onChange(isNaN(num) ? 0 : num);
                }}
                keyboardType="decimal-pad"
                placeholder={t('enterAmount')}
                error={!!errors.amount || !!amountError}
                errorMessage={amountError || getErrorMessage(errors.amount)}
                leadingIcon="cash-outline"
              />
            )}
          />

          {/* Payment Date */}
          <Controller
            control={control}
            name="paidAt"
            render={({ field: { onChange, value } }) => (
              <DateTimePicker
                labelText={`${t('paymentDate')} *`}
                value={value}
                mode="date"
                onChange={onChange}
                error={!!errors.paidAt}
                errorMessage={getErrorMessage(errors.paidAt)}
              />
            )}
          />

          {/* Payment Method */}
          <Controller
            control={control}
            name="method"
            render={({ field: { onChange, value } }) => (
              <Select
                value={value || 'cash'}
                onValueChange={onChange}
                error={!!errors.method}
                errorMessage={getErrorMessage(errors.method)}
              >
                <SelectTrigger
                  placeholder={t('selectPaymentMethod')}
                  labelText={`${t('paymentMethod')} *`}
                />
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem
                      key={method.value}
                      label={method.label}
                      value={method.value}
                    />
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          {/* Reference */}
          <Controller
            control={control}
            name="reference"
            render={({ field: { onChange, value } }) => (
              <Input
                label={t('paymentReference')}
                value={value || ''}
                onChangeText={onChange}
                placeholder={t('enterReference')}
                error={!!errors.reference}
                errorMessage={getErrorMessage(errors.reference)}
                leadingIcon="receipt-outline"
              />
            )}
          />

          {/* Notes */}
          <Controller
            control={control}
            name="note"
            render={({ field: { onChange, value } }) => (
              <Input
                label={t('paymentNotes')}
                value={value || ''}
                onChangeText={onChange}
                placeholder={t('enterNotes')}
                multiline
                numberOfLines={3}
                error={!!errors.note}
                errorMessage={getErrorMessage(errors.note)}
                leadingIcon="document-text-outline"
              />
            )}
          />
        </ScrollView>

        {/* Footer with actions */}
        <View
          style={{
            padding: 16,
            borderTopWidth: 1,
            borderTopColor: theme.border,
            backgroundColor: theme.card,
            gap: 12,
          }}
        >
          <Button
            onPress={handleSubmit(handleFormSubmit)}
            disabled={isSubmitting || !!amountError}
            isLoading={isSubmitting}
          >
            <ButtonText>{t('save')}</ButtonText>
          </Button>

          <Button variant="outline" onPress={onClose} disabled={isSubmitting}>
            <ButtonText>{t('cancel')}</ButtonText>
          </Button>
        </View>
      </SafeAreaView>
    </Modal>
  );
};
