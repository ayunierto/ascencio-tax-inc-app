import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

import {
  Invoice,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  createInvoiceSchema,
  updateInvoiceSchema,
} from '@ascencio/shared';
import { Input } from '@/components/ui/Input';
import { getErrorMessage } from '@/utils/getErrorMessage';
import {
  theme,
  Button,
  ButtonText,
  ButtonIcon,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { ErrorBox } from '@/core/auth/components/ErrorBox';
import { ThemedText } from '@/components/ui/ThemedText';
import DateTimePicker from '@/components/ui/DateTimePicker/DateTimePicker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/Select';
import { ImageUploader } from '@/components/ui/ImageUploader';
import {
  useCreateInvoiceMutation,
  useDeleteInvoiceMutation,
  useUpdateInvoiceMutation,
  useGeneratePdfMutation,
  useIssueInvoiceMutation,
  useRecordPaymentMutation,
} from '../hooks';
import { useCompanies } from '../../companies/hooks';
import { useClients } from '../../clients/hooks';
import { ClientSelector } from './ClientSelector/';
import { RecordPaymentModal } from './RecordPaymentModal';
import { CustomHeader, HeaderButton } from '@/components/ui';

interface InvoiceFormProps {
  invoice: Invoice;
  headerLeft?: React.ReactNode;
}

interface LineItemLocal {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

const generateLocalId = () =>
  `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const toNumber = (value: unknown, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

export const InvoiceForm = ({ invoice, headerLeft }: InvoiceFormProps) => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [isManualClientEntry, setIsManualClientEntry] = useState(
    !invoice.billToClientId && !!invoice.billToName,
  );
  // Track price text inputs to allow typing decimals like "1."
  const [priceTexts, setPriceTexts] = useState<Record<string, string>>({});

  const isNew = invoice.id === 'new';

  // Initialize line items from invoice or with one empty row
  const [lineItems, setLineItems] = useState<LineItemLocal[]>(() => {
    if (invoice.lineItems && invoice.lineItems.length > 0) {
      return invoice.lineItems.map((item) => ({
        id: item.id,
        description: item.description,
        quantity: toNumber(item.quantity, 1),
        price: toNumber(item.price, 0),
      }));
    }
    return [{ id: generateLocalId(), description: '', quantity: 1, price: 0 }];
  });

  const { data: companiesData } = useCompanies();
  const companies = companiesData?.items ?? [];

  const { data: clientsData } = useClients();
  const clients = clientsData?.items ?? [];

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateInvoiceRequest | UpdateInvoiceRequest>({
    resolver: zodResolver(
      isNew ? createInvoiceSchema : updateInvoiceSchema,
    ) as any,
    defaultValues: {
      fromCompanyId:
        invoice.fromCompanyId ||
        (companies.length === 1 ? companies[0].id : ''),
      billToClientId: invoice.billToClientId || '',
      billToFullName: invoice.billToName || '',
      billToEmail: invoice.billToEmail || '',
      billToPhone: invoice.billToPhone || '',
      billToAddress: invoice.billToAddress || '',
      billToCity: invoice.billToCity || '',
      billToProvince: invoice.billToProvince || '',
      billToPostalCode: invoice.billToPostalCode || '',
      billToCountry: invoice.billToCountry || '',
      taxRate: toNumber(invoice.taxRate, 13),
      notes: invoice.notes || '',
      logoUrl: invoice.logoUrl || '',
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      lineItems: invoice.lineItems?.map((item) => ({
        description: item.description,
        quantity: toNumber(item.quantity, 1),
        price: toNumber(item.price, 0),
      })) || [{ description: '', quantity: 1, price: 0 }],
      status: invoice.status || 'pending',
    },
  });

  const watchedTaxRate = watch('taxRate') ?? 13;

  // Calculate totals
  const { subtotal, taxAmount, total } = useMemo(() => {
    const sub = lineItems.reduce((sum, item) => {
      return sum + item.quantity * item.price;
    }, 0);
    const rate =
      typeof watchedTaxRate === 'number'
        ? watchedTaxRate
        : parseFloat(String(watchedTaxRate) || '13');
    const tax = sub * (rate / 100);
    return {
      subtotal: sub,
      taxAmount: tax,
      total: sub + tax,
    };
  }, [lineItems, watchedTaxRate]);

  // Mutations
  const createInvoice = useCreateInvoiceMutation();
  const updateInvoice = useUpdateInvoiceMutation();
  const deleteInvoice = useDeleteInvoiceMutation();
  const generatePdf = useGeneratePdfMutation();
  const issueInvoice = useIssueInvoiceMutation();
  const recordPayment = useRecordPaymentMutation();

  const isDraft = invoice.status === 'draft';
  const canEdit = isDraft || invoice.status === 'canceled';
  const canIssue = isDraft && !isNew;

  // Prevent state updates after unmount
  const isMounted = useRef(true);
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  /**
   * Handler for validation errors - logs errors for debugging
   */
  const onValidationError = (formErrors: any) => {
    console.warn('Validation errors:', formErrors);
    // Errors are now displayed persistently in the form fields
    // No need for toast notifications on validation errors
  };

  const handleGeneratePdf = async () => {
    if (isNew) return;

    setIsGeneratingPdf(true);
    try {
      await generatePdf.mutateAsync(invoice.id);
      toast.success(t('pdfGenerated'));
    } catch (error: any) {
      toast.error(t(error.response?.data?.message || 'unknownErrorOccurred'));
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleIssueInvoice = async () => {
    if (!canIssue) return;

    Alert.alert(t('issueInvoice'), t('issueInvoiceConfirmation'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('issue'),
        onPress: async () => {
          console.log('[INVOICE FORM] Issuing invoice:', invoice.id);
          try {
            const result = await issueInvoice.mutateAsync(invoice.id);
            console.log('[INVOICE FORM] Invoice issued successfully:', result);
            toast.success(t('invoiceIssued'));
            router.back();
          } catch (error: any) {
            console.error('[INVOICE FORM] Error issuing invoice:', error);
            console.error('[INVOICE FORM] Error response:', error.response);
            console.error('[INVOICE FORM] Error data:', error.response?.data);

            const errorMessage =
              error.response?.data?.message ||
              error.message ||
              'unknownErrorOccurred';
            console.error('[INVOICE FORM] Showing error toast:', errorMessage);
            toast.error(t(errorMessage));
          }
        },
      },
    ]);
  };

  const handleRecordPayment = async (data: any) => {
    console.log('[INVOICE FORM] Recording payment:', data);
    try {
      const result = await recordPayment.mutateAsync({
        invoiceId: invoice.id,
        data,
      });
      console.log('[INVOICE FORM] Payment recorded successfully:', result);
      toast.success(t('paymentSuccess'));
      setIsPaymentModalVisible(false);
    } catch (error: any) {
      console.error('[INVOICE FORM] Error recording payment:', error);
      console.error('[INVOICE FORM] Error response:', error.response);
      console.error('[INVOICE FORM] Error data:', error.response?.data);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'unknownErrorOccurred';
      console.error('[INVOICE FORM] Showing error toast:', errorMessage);
      toast.error(t(errorMessage));
      // throw error; // Re-throw to prevent modal from closing on error
    }
  };

  // Update line items in form when local state changes
  const updateLineItemsInForm = (items: LineItemLocal[]) => {
    const normalized = items.map((item) => ({
      ...item,
      quantity: toNumber(item.quantity, 1),
      price: toNumber(item.price, 0),
    }));
    setLineItems(normalized);
    setValue(
      'lineItems',
      normalized.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        price: item.price,
      })),
    );
  };

  const addLineItem = () => {
    const newItems = [
      ...lineItems,
      { id: generateLocalId(), description: '', quantity: 1, price: 0 },
    ];
    updateLineItemsInForm(newItems);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length <= 1) {
      toast.error(t('atLeastOneLineItemRequired'));
      return;
    }
    const newItems = lineItems.filter((item) => item.id !== id);
    updateLineItemsInForm(newItems);
  };

  const updateLineItem = (
    id: string,
    field: keyof LineItemLocal,
    value: string | number,
  ) => {
    const newItems = lineItems.map((item) => {
      if (item.id === id) {
        if (field === 'quantity' || field === 'price') {
          return {
            ...item,
            [field]: toNumber(value, field === 'quantity' ? 1 : 0),
          };
        }
        return { ...item, [field]: value };
      }
      return item;
    });
    updateLineItemsInForm(newItems);
  };

  const onSubmit = async (values: any) => {
    console.log('[INVOICE FORM] Starting submit with values:', values);

    // Validate line items
    const validLineItems = lineItems.filter(
      (item) => item.description.trim() !== '',
    );
    if (validLineItems.length === 0) {
      console.log('[INVOICE FORM] Validation failed: No valid line items');
      toast.error(t('atLeastOneLineItemRequired'));
      return;
    }

    // Clean empty strings and convert to undefined for optional fields
    const cleanValue = (val: any) => {
      if (val === '' || val === null) return undefined;
      return val;
    };

    const submitData: CreateInvoiceRequest = {
      ...values,
      lineItems: validLineItems.map((item) => ({
        description: item.description,
        quantity: toNumber(item.quantity, 1),
        price: toNumber(item.price, 0),
      })),
      taxRate: toNumber(values.taxRate, 13),
      // Clean optional string fields
      fromCompanyId: cleanValue(values.fromCompanyId),
      billToClientId: cleanValue(values.billToClientId),
      description: cleanValue(values.description),
      notes: cleanValue(values.notes),
      logoUrl: cleanValue(values.logoUrl),
      billToFullName: cleanValue(values.billToFullName),
      billToEmail: cleanValue(values.billToEmail),
      billToPhone: cleanValue(values.billToPhone),
      billToAddress: cleanValue(values.billToAddress),
      billToCity: cleanValue(values.billToCity),
      billToProvince: cleanValue(values.billToProvince),
      billToPostalCode: cleanValue(values.billToPostalCode),
      billToCountry: cleanValue(values.billToCountry),
      billToSIN: cleanValue(values.billToSIN),
      billToBusinessNumber: cleanValue(values.billToBusinessNumber),
    };

    console.log('[INVOICE FORM] Submit data prepared:', submitData);

    try {
      if (!isNew) {
        console.log('[INVOICE FORM] Updating invoice:', invoice.id);
        const result = await updateInvoice.mutateAsync({
          id: invoice.id,
          data: submitData,
        });
        console.log('[INVOICE FORM] Update successful:', result);

        if (!isMounted.current) return;
        toast.success(t('invoiceUpdatedSuccessfully'));
        // Stay on the current invoice page after updating
        // No navigation needed, just refresh the data
      } else {
        console.log('[INVOICE FORM] Creating new invoice');
        const result = await createInvoice.mutateAsync(submitData);
        console.log('[INVOICE FORM] Create successful:', result);

        if (!isMounted.current) return;
        toast.success(t('invoiceCreatedSuccessfully'));
        // Navigate to the created invoice page with its ID
        if (result && result.id) {
          router.replace(`/(app)/invoices/${result.id}`);
        } else {
          router.replace('/(app)/invoices');
        }
      }
    } catch (error: any) {
      console.error('[INVOICE FORM] Error submitting invoice:', error);
      console.error('[INVOICE FORM] Error response:', error.response);
      console.error('[INVOICE FORM] Error data:', error.response?.data);

      if (!isMounted.current) return;

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'unknownErrorOccurred';
      console.error('[INVOICE FORM] Showing error toast:', errorMessage);
      toast.error(t(errorMessage));
    }
  };

  const handleDeleteInvoice = async () => {
    Alert.alert(t('deleteInvoice'), t('deleteInvoiceConfirmation'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => {
          setIsDeleting(true);
          try {
            await deleteInvoice.mutateAsync(invoice.id, {
              onSuccess: () => {
                toast.success(t('deleteSuccess'));
                setTimeout(() => router.back(), 500);
              },
              onError: (error: any) => {
                toast.error(
                  t(
                    error.response?.data?.message ||
                      error.message ||
                      'canNotDelete',
                  ),
                );
                setIsDeleting(false);
              },
            });
          } catch (error) {
            console.error('Error deleting invoice:', error);
            toast.error(t('unknownErrorOccurred'));
            setIsDeleting(false);
          }
        },
      },
    ]);
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: isNew
        ? t('newInvoice')
        : `${t('invoice')} #${invoice.invoiceNumber}`,
    });
  }, [isNew, t, invoice.invoiceNumber]);

  // Botones del header derecho
  const headerRightButtons = (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {canEdit && (
        <HeaderButton
          onPress={handleSubmit(onSubmit, onValidationError)}
          hitSlop={12}
        >
          {createInvoice.isPending || updateInvoice.isPending ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <Ionicons name="save-outline" size={24} color={theme.primary} />
          )}
        </HeaderButton>
      )}

      {!isNew && canEdit && (
        <HeaderButton onPress={handleDeleteInvoice} hitSlop={12}>
          {isDeleting ? (
            <ActivityIndicator size="small" color={theme.destructive} />
          ) : (
            <Ionicons
              name="trash-outline"
              size={24}
              color={theme.destructive}
            />
          )}
        </HeaderButton>
      )}
    </View>
  );

  return (
    <>
      <CustomHeader
        title={
          isNew ? t('newInvoice') : `${t('invoice')} #${invoice.invoiceNumber}`
        }
        left={headerLeft}
        right={headerRightButtons}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        // keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 80}
      >
        <ScrollView
          style={{ padding: 10, flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            // paddingBottom: insets.bottom + 40,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ flex: 1, gap: 16 }}>
            {/* Error Box for general form errors */}
            {Object.keys(errors).length > 0 && (
              <ErrorBox message={t('pleaseFixFormErrors')} />
            )}
            {/* Invoice Number (read-only for existing) */}
            {!isNew && (
              <View
                style={{
                  padding: 12,
                  backgroundColor: theme.card,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              >
                <ThemedText style={{ color: theme.muted, fontSize: 12 }}>
                  {t('invoiceNumber')}
                </ThemedText>
                <ThemedText style={{ fontWeight: 'bold', fontSize: 18 }}>
                  {invoice.invoiceNumber}
                </ThemedText>
              </View>
            )}

            {/* Section: From Company */}
            <View>
              {companies.length === 0 && (
                <View
                  style={{
                    padding: 12,
                    backgroundColor: '#eff6ff',
                    borderRadius: 8,
                    borderLeftWidth: 4,
                    borderLeftColor: '#3b82f6',
                    marginBottom: 12,
                    flexDirection: 'row',
                    gap: 8,
                  }}
                >
                  <Ionicons
                    name="information-circle"
                    size={20}
                    color="#3b82f6"
                  />
                  <ThemedText
                    style={{ flex: 1, fontSize: 14, color: '#1e40af' }}
                  >
                    {t('soleProprietorAutoCreate')}
                  </ThemedText>
                </View>
              )}

              <Controller
                control={control}
                name="fromCompanyId"
                render={({ field: { onChange, value } }) => (
                  <Select
                    value={value || ''}
                    onValueChange={(val) => onChange(val || undefined)}
                    options={[
                      {
                        label:
                          companies.length === 0
                            ? t('soleProprietor')
                            : t('selectCompany'),
                        value: '',
                      },
                      ...companies.map((company) => ({
                        label: company.name,
                        value: company.id,
                      })),
                    ]}
                    disabled={companies.length === 0}
                    error={!!errors.fromCompanyId}
                    errorMessage={getErrorMessage(errors.fromCompanyId)}
                  >
                    <SelectTrigger
                      placeholder={
                        companies.length === 0
                          ? t('soleProprietor')
                          : t('selectCompany')
                      }
                      labelText={t('fromCompany')}
                    />
                    <SelectContent>
                      <SelectItem label={t('selectCompany')} value="" />
                      {companies.map((company) => (
                        <SelectItem
                          key={company.id}
                          label={company.name}
                          value={company.id}
                        />
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </View>

            {/* Section: Bill To (Client Selector) */}
            <View>
              <Controller
                control={control}
                name="billToClientId"
                render={({ field: { onChange, value } }) => (
                  <View>
                    <ClientSelector
                      clients={clients}
                      selectedClientId={value || undefined}
                      onClientSelect={(clientId) => {
                        onChange(clientId || '');
                        if (clientId) {
                          // Clear manual fields when client is selected
                          setValue('billToFullName', '');
                          setValue('billToEmail', '');
                          setValue('billToPhone', '');
                        }
                      }}
                      onManualMode={(enabled) => {
                        setIsManualClientEntry(enabled);
                        // When switching to manual mode, clear the selected client
                        if (enabled) {
                          onChange('');
                        } else {
                          // When switching to search mode, clear manual fields
                          setValue('billToFullName', '');
                          setValue('billToEmail', '');
                          setValue('billToPhone', '');
                        }
                      }}
                      isManualMode={isManualClientEntry}
                      hasClientError={!!errors.billToClientId}
                      hasManualFieldsError={
                        !!(
                          errors.billToFullName ||
                          errors.billToEmail ||
                          errors.billToPhone
                        )
                      }
                      clientErrorMessage={getErrorMessage(
                        errors.billToClientId,
                      )}
                      manualFieldsErrorMessage={
                        errors.billToFullName
                          ? getErrorMessage(errors.billToFullName)
                          : errors.billToEmail
                            ? getErrorMessage(errors.billToEmail)
                            : errors.billToPhone
                              ? getErrorMessage(errors.billToPhone)
                              : undefined
                      }
                    />
                  </View>
                )}
              />

              {/* Manual Client Entry Fields */}
              {isManualClientEntry && (
                <View style={{ gap: 12, marginTop: 12 }}>
                  <Controller
                    control={control}
                    name="billToFullName"
                    render={({ field: { onChange, value } }) => (
                      <Input
                        label={`${t('clientName')} *`}
                        value={value}
                        onChangeText={onChange}
                        placeholder={t('enterClientName')}
                        editable={canEdit}
                        error={!!errors.billToFullName}
                        errorMessage={getErrorMessage(errors.billToFullName)}
                        autoCapitalize="words"
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="billToEmail"
                    render={({ field: { onChange, value } }) => (
                      <Input
                        label={t('email')}
                        value={value}
                        onChangeText={onChange}
                        placeholder={t('enterEmail')}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={canEdit}
                        error={!!errors.billToEmail}
                        errorMessage={getErrorMessage(errors.billToEmail)}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="billToPhone"
                    render={({ field: { onChange, value } }) => (
                      <Input
                        label={t('phone')}
                        value={value}
                        onChangeText={onChange}
                        placeholder={t('enterPhone')}
                        keyboardType="phone-pad"
                        autoCapitalize="none"
                        editable={canEdit}
                        error={!!errors.billToPhone}
                        errorMessage={getErrorMessage(errors.billToPhone)}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="billToAddress"
                    render={({ field: { onChange, value } }) => (
                      <Input
                        label={t('address')}
                        value={value}
                        onChangeText={onChange}
                        placeholder={t('enterAddress')}
                        multiline
                        numberOfLines={3}
                        editable={canEdit}
                        error={!!errors.billToAddress}
                        errorMessage={getErrorMessage(errors.billToAddress)}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="billToCity"
                    render={({ field: { onChange, value } }) => (
                      <Input
                        label={t('city')}
                        value={value}
                        onChangeText={onChange}
                        placeholder={t('enterCity')}
                        editable={canEdit}
                        error={!!errors.billToCity}
                        errorMessage={getErrorMessage(errors.billToCity)}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="billToProvince"
                    render={({ field: { onChange, value } }) => (
                      <Input
                        label={t('province')}
                        value={value}
                        onChangeText={onChange}
                        placeholder={t('enterProvince')}
                        editable={canEdit}
                        error={!!errors.billToProvince}
                        errorMessage={getErrorMessage(errors.billToProvince)}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="billToPostalCode"
                    render={({ field: { onChange, value } }) => (
                      <Input
                        label={t('postalCode')}
                        value={value}
                        onChangeText={onChange}
                        placeholder={t('enterPostalCode')}
                        editable={canEdit}
                        error={!!errors.billToPostalCode}
                        errorMessage={getErrorMessage(errors.billToPostalCode)}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="billToCountry"
                    render={({ field: { onChange, value } }) => (
                      <Input
                        label={t('country')}
                        value={value}
                        onChangeText={onChange}
                        placeholder={t('enterCountry')}
                        editable={canEdit}
                        error={!!errors.billToCountry}
                        errorMessage={getErrorMessage(errors.billToCountry)}
                      />
                    )}
                  />
                </View>
              )}
            </View>

            {/* Section: Dates */}
            <Card>
              <CardHeader>
                <CardTitle>{t('dates')}</CardTitle>
              </CardHeader>
              <CardContent style={{ gap: theme.gap, flexDirection: 'row' }}>
                <View style={{ flex: 1 }}>
                  <Controller
                    control={control}
                    name="issueDate"
                    render={({ field: { onChange, value } }) => (
                      <DateTimePicker
                        labelText={t('issueDate')}
                        value={value}
                        mode="date"
                        onChange={onChange}
                        error={!!errors.issueDate}
                        errorMessage={errors.issueDate?.message}
                      />
                    )}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Controller
                    control={control}
                    name="dueDate"
                    render={({ field: { onChange, value } }) => (
                      <DateTimePicker
                        labelText={t('dueDate')}
                        value={value}
                        mode="date"
                        onChange={onChange}
                        error={!!errors.dueDate}
                        errorMessage={errors.dueDate?.message}
                      />
                    )}
                  />
                </View>
              </CardContent>
            </Card>

            {/* Section: Line Items */}
            <View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <ThemedText style={{ fontWeight: '600', fontSize: 16 }}>
                  {t('lineItems')}
                </ThemedText>

                <Button size="sm" onPress={addLineItem} disabled={!canEdit}>
                  <ButtonIcon name="add-circle-outline" />
                  <ButtonText size="sm">{t('addItem')}</ButtonText>
                </Button>
              </View>

              {/* Error Message for Line Items */}
              {errors.lineItems &&
                !Array.isArray(errors.lineItems) &&
                errors.lineItems.message && (
                  <View
                    style={{
                      marginBottom: 8,
                      padding: 8,
                      backgroundColor: theme.destructive + '11',
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: theme.destructive + '33',
                    }}
                  >
                    <ThemedText
                      style={{ color: theme.destructive, fontSize: 14 }}
                    >
                      {t(errors.lineItems.message as string)}
                    </ThemedText>
                  </View>
                )}

              {lineItems.map((item, index) => (
                <Card
                  key={item.id}
                  style={{
                    marginBottom: 8,
                    borderWidth: 1,
                    borderColor: theme.border,
                    position: 'relative',
                  }}
                >
                  <CardContent style={{ gap: theme.gap }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginHorizontal: 4,
                        position: 'static',
                      }}
                    >
                      <ThemedText style={{ color: theme.mutedForeground }}>
                        {t('item')} #{index + 1}
                      </ThemedText>

                      <Button
                        style={{ position: 'absolute', top: 0, right: 4 }}
                        size="sm"
                        variant="ghost"
                        onPress={() => removeLineItem(item.id)}
                        disabled={lineItems.length <= 1}
                      >
                        <ButtonIcon
                          name="trash-outline"
                          style={{ color: theme.destructive }}
                        />
                      </Button>
                    </View>

                    <Input
                      label={t('description')}
                      value={item.description}
                      onChangeText={(text) =>
                        updateLineItem(item.id, 'description', text)
                      }
                      style={{ marginBottom: 8 }}
                      error={!!errors.lineItems?.[index]?.description}
                      errorMessage={getErrorMessage(
                        errors.lineItems?.[index]?.description,
                      )}
                    />

                    {/* quantity, price and total */}
                    <View
                      style={{
                        flexDirection: 'row',
                        gap: 12,
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Input
                        label={t('quantity')}
                        value={item.quantity.toString()}
                        onChangeText={(text) => {
                          if (text === '') {
                            updateLineItem(item.id, 'quantity', 0);
                            return;
                          }
                          const num = parseInt(text);
                          if (!isNaN(num)) {
                            updateLineItem(item.id, 'quantity', num);
                          }
                        }}
                        keyboardType="numeric"
                        style={{ flex: 1 }}
                        error={!!errors.lineItems?.[index]?.quantity}
                        errorMessage={getErrorMessage(
                          errors.lineItems?.[index]?.quantity,
                        )}
                      />

                      <Input
                        label={t('price')}
                        value={priceTexts[item.id] ?? item.price.toString()}
                        onChangeText={(text) => {
                          // Store the text as-is for display
                          setPriceTexts((prev) => ({
                            ...prev,
                            [item.id]: text,
                          }));

                          // Allow empty string
                          if (text === '') {
                            updateLineItem(item.id, 'price', 0);
                            return;
                          }
                          // Allow decimal format: digits and one decimal point
                          if (/^\d*\.?\d*$/.test(text)) {
                            const num = parseFloat(text) || 0;
                            updateLineItem(item.id, 'price', num);
                          }
                        }}
                        onBlur={() => {
                          // Clear the text state on blur so it syncs with the actual number value
                          setPriceTexts((prev) => {
                            const newState = { ...prev };
                            delete newState[item.id];
                            return newState;
                          });
                        }}
                        keyboardType="decimal-pad"
                        style={{ flex: 1 }}
                        error={!!errors.lineItems?.[index]?.price}
                        errorMessage={getErrorMessage(
                          errors.lineItems?.[index]?.price,
                        )}
                      />

                      <Input
                        label={t('total')}
                        value={`$${(item.quantity * item.price).toFixed(2)}`}
                        editable={false}
                        style={{ flex: 1 }}
                      />
                    </View>
                  </CardContent>
                </Card>
              ))}
            </View>

            {/* Section: Tax Rate */}
            <Controller
              control={control}
              name="taxRate"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={`${t('taxRate')} (%)`}
                  value={(value ?? 13).toString()}
                  onChangeText={(text) => {
                    const num = parseFloat(text);
                    onChange(isNaN(num) ? 0 : num);
                  }}
                  keyboardType="decimal-pad"
                  editable={canEdit}
                  error={!!errors.taxRate}
                  errorMessage={getErrorMessage(errors.taxRate)}
                />
              )}
            />

            {/* Section: Financial Summary */}
            <View
              style={{
                backgroundColor: theme.card,
                borderRadius: 8,
                padding: 16,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <ThemedText
                style={{ fontWeight: '600', fontSize: 16, marginBottom: 12 }}
              >
                {t('summary')}
              </ThemedText>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                <ThemedText style={{ color: theme.muted }}>
                  {t('subtotal')}
                </ThemedText>
                <ThemedText style={{ fontFamily: 'monospace' }}>
                  ${subtotal.toFixed(2)}
                </ThemedText>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                <ThemedText style={{ color: theme.muted }}>
                  {t('tax')} ({watchedTaxRate}%)
                </ThemedText>
                <ThemedText style={{ fontFamily: 'monospace' }}>
                  ${taxAmount.toFixed(2)}
                </ThemedText>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingTop: 8,
                  borderTopWidth: 1,
                  borderTopColor: theme.border,
                }}
              >
                <ThemedText style={{ fontWeight: 'bold', fontSize: 16 }}>
                  {t('total')}
                </ThemedText>
                <ThemedText
                  style={{
                    fontWeight: 'bold',
                    fontSize: 16,
                    fontFamily: 'monospace',
                  }}
                >
                  ${total.toFixed(2)}
                </ThemedText>
              </View>
            </View>

            {/* Section: Notes */}
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t('notes')}
                  onChangeText={onChange}
                  value={value || ''}
                  multiline
                  numberOfLines={3}
                  editable={canEdit}
                  error={!!errors.notes}
                  errorMessage={getErrorMessage(errors.notes)}
                  helperText={t('notesHelperText')}
                />
              )}
            />

            {/* Section: Logo */}
            <View>
              <ThemedText
                style={{ marginBottom: 8, fontWeight: '600', fontSize: 16 }}
              >
                {t('logo')} ({t('optional')})
              </ThemedText>
              <Controller
                control={control}
                name="logoUrl"
                render={({ field: { onChange, value } }) => (
                  <ImageUploader
                    value={value}
                    onChange={onChange}
                    folder="invoices"
                  />
                )}
              />
            </View>

            {/* PDF Actions */}
            {!isNew && (
              <View style={{ gap: 12 }}>
                <Button
                  onPress={handleGeneratePdf}
                  disabled={isGeneratingPdf}
                  variant="outline"
                  style={{ flexDirection: 'row', gap: 8 }}
                >
                  {isGeneratingPdf ? (
                    <ActivityIndicator size="small" color={theme.primary} />
                  ) : (
                    <ButtonIcon name="document-text-outline" />
                  )}
                  <ButtonText>{t('generatePdf')}</ButtonText>
                </Button>

                {/* Issue Invoice Button */}
                {canIssue && (
                  <Button
                    onPress={handleIssueInvoice}
                    disabled={issueInvoice.isPending}
                    style={{
                      flexDirection: 'row',
                      gap: 8,
                      backgroundColor: theme.success,
                    }}
                  >
                    {issueInvoice.isPending ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <ButtonIcon name="checkmark-circle-outline" />
                    )}
                    <ButtonText>{t('issueInvoice')}</ButtonText>
                  </Button>
                )}

                {/* Payment Info for issued invoices */}
                {!isDraft && invoice.status !== 'canceled' && (
                  <View
                    style={{
                      padding: 12,
                      backgroundColor: theme.card,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: theme.border,
                      gap: 8,
                    }}
                  >
                    <ThemedText style={{ fontWeight: 'bold' }}>
                      {t('paymentStatus')}
                    </ThemedText>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}
                    >
                      <ThemedText>{t('amountPaid')}:</ThemedText>
                      <ThemedText style={{ fontWeight: '600' }}>
                        CA${Number(invoice.amountPaid).toFixed(2)}
                      </ThemedText>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}
                    >
                      <ThemedText>{t('balanceDue')}:</ThemedText>
                      <ThemedText
                        style={{
                          fontWeight: '600',
                          color:
                            invoice.balanceDue > 0
                              ? theme.destructive
                              : theme.success,
                        }}
                      >
                        CA${Number(invoice.balanceDue).toFixed(2)}
                      </ThemedText>
                    </View>
                    {invoice.balanceDue > 0 && (
                      <Button
                        onPress={() => setIsPaymentModalVisible(true)}
                        variant="default"
                        style={{ marginTop: 8 }}
                      >
                        <ButtonText>{t('recordPayment')}</ButtonText>
                      </Button>
                    )}
                  </View>
                )}

                {/* Draft Note */}
                {isDraft && !isNew && (
                  <View
                    style={{
                      padding: 12,
                      backgroundColor: '#f59e0b20',
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: '#f59e0b',
                    }}
                  >
                    <ThemedText style={{ color: '#f59e0b', fontSize: 12 }}>
                      {t('draftInvoiceNote')}
                    </ThemedText>
                  </View>
                )}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Record Payment Modal */}
        <RecordPaymentModal
          visible={isPaymentModalVisible}
          onClose={() => setIsPaymentModalVisible(false)}
          onSubmit={handleRecordPayment}
          remainingBalance={Number(invoice.balanceDue) || 0}
          invoiceNumber={invoice.invoiceNumber}
          isSubmitting={recordPayment.isPending}
        />
      </KeyboardAvoidingView>
    </>
  );
};
