import React, { useState, useRef } from 'react';
import { ScrollView, View, Linking, Platform } from 'react-native';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner-native';
import { useTranslation } from 'react-i18next';
import { fetch } from 'expo/fetch';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';

import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/Select';
import DateTimePicker from '@/components/ui/DateTimePicker/DateTimePicker';
import { Category } from '@/core/accounting/categories/interfaces/category.interface';
import {
  Button,
  ButtonIcon,
  theme,
  ImageUploader,
  ImageUploaderRef,
  CustomHeader,
  HeaderButton,
} from '@/components/ui';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { DeleteConfirmationDialog, FormViewContainer } from '@/core/components';
import { useReceiptImageMutation } from '@/core/accounting/expenses/hooks/useReceiptImageMutation';
import {
  CreateExpenseInput,
  createExpenseSchema,
  Expense,
  Subcategory,
} from '@ascencio/shared';
import {
  createExpenseMutation,
  deleteExpenseMutation,
  updateExpenseMutation,
} from '../../hooks';

interface ExpenseFormProps {
  expense: Expense;
  categories: Category[];
}

export default function ExpenseForm({ expense, categories }: ExpenseFormProps) {
  const { t } = useTranslation();
  const imageUploaderRef = useRef<ImageUploaderRef>(null);
  const lastScannedImageRef = useRef<string | undefined>(undefined);
  const hasAutoScannedRef = useRef<boolean>(false);
  const [subcategories, setSubcategories] = useState<Subcategory[]>(
    categories.find((cat) => cat.id === expense.category?.id)?.subcategories ||
      [],
  );

  const { getReceiptValuesMutation } = useReceiptImageMutation();
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm<CreateExpenseInput>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      id: expense.id,
      date: expense.date.toString(),
      merchant: expense.merchant,
      total: expense.total,
      tax: expense.tax,
      imageUrl: expense.imageUrl || undefined,
      notes: expense.notes || undefined,
      categoryId: expense.category?.id || undefined,
      subcategoryId: expense.subcategory?.id || undefined,
    },
  });

  // Update form when expense changes (after scan)
  React.useEffect(() => {
    reset({
      id: expense.id,
      date: expense.date.toString(),
      merchant: expense.merchant,
      total: expense.total,
      tax: expense.tax,
      imageUrl: expense.imageUrl || undefined,
      notes: expense.notes || undefined,
      categoryId: expense.category?.id || undefined,
      subcategoryId: expense.subcategory?.id || undefined,
    });
  }, [expense, reset]);

  const createMutation = createExpenseMutation();
  const updateMutation = updateExpenseMutation();
  const deleteMutation = deleteExpenseMutation();

  const watchedImageUrl = watch('imageUrl');
  const previousImageUrlRef = useRef<string | undefined>(watchedImageUrl);

  // Auto scan when a new temp receipt image is uploaded (form value)
  React.useEffect(() => {
    const previousImageUrl = previousImageUrlRef.current;
    const currentImageUrl = watchedImageUrl;

    // Update the previous value for next comparison
    previousImageUrlRef.current = currentImageUrl;

    // Don't scan if no image
    if (!currentImageUrl) return;

    // Don't scan if not a temp image (already saved images)
    if (!currentImageUrl.startsWith('temp_receipts/')) return;

    // Don't scan if it's the same image we already scanned
    if (lastScannedImageRef.current === currentImageUrl) return;

    // CRITICAL: Don't scan on initial mount - only when image actually changes
    // This prevents scanning when opening an existing expense from the list
    if (previousImageUrl === currentImageUrl) return;

    // Don't scan if this is the first render and image was already there
    // (opening existing expense with image)
    if (previousImageUrl === undefined && expense.imageUrl === currentImageUrl)
      return;

    // Mark this image as scanned
    lastScannedImageRef.current = currentImageUrl;
    hasAutoScannedRef.current = true;

    // Convert relative path to full Cloudinary URL
    const cloudinaryCloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudinaryCloudName) {
      console.error('Cloudinary cloud name not configured');
      return;
    }
    const fullImageUrl = `https://res.cloudinary.com/${cloudinaryCloudName}/image/upload/${currentImageUrl}`;
    handleScanReceipt(fullImageUrl);
  }, [watchedImageUrl, expense.imageUrl]);

  const onSubmit = async (data: CreateExpenseInput) => {
    console.log('[EXPENSE FORM] onSubmit called with data:', data);
    console.log('[EXPENSE FORM] Expense ID:', data.id);
    console.log('[EXPENSE FORM] Is update?', data.id && data.id !== 'new');

    try {
      // Validate and transform data through schema (converts strings to numbers)
      const validatedData = createExpenseSchema.parse(data);

      if (validatedData.id && validatedData.id !== 'new') {
        console.log('[EXPENSE FORM] Updating expense...');
        const result = await updateMutation.mutateAsync(validatedData);
        console.log('[EXPENSE FORM] Update result:', result);
        // Mark image as saved to prevent cleanup
        imageUploaderRef.current?.markAsSaved();
        console.log('[EXPENSE FORM] Showing success toast');
        toast.success(t('expenseUpdatedSuccessfully'));
        console.log('[EXPENSE FORM] Navigating back');
        setTimeout(() => router.back(), 500);
      } else {
        console.log('[EXPENSE FORM] Creating expense...');
        const result = await createMutation.mutateAsync(validatedData);
        console.log('[EXPENSE FORM] Create result:', result);
        // Mark image as saved to prevent cleanup
        imageUploaderRef.current?.markAsSaved();
        console.log('[EXPENSE FORM] Showing success toast');
        toast.success(t('expenseCreatedSuccessfully'));
        console.log('[EXPENSE FORM] Navigating back');
        setTimeout(() => router.back(), 500);
      }
    } catch (error: any) {
      console.error('[EXPENSE FORM] Error saving expense:', error);
      console.error('[EXPENSE FORM] Error response:', error?.response?.data);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          t('unknownErrorOccurred'),
      );
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(expense.id, {
        onSuccess: () => {
          toast.success(t('deleteSuccess'));
          setTimeout(() => router.back(), 500);
        },
        onError: (error) => {
          toast.error(
            t(error.response?.data?.message || error.message || 'canNotDelete'),
          );
        },
      });
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error(t('unknownError'));
    }
  };

  const handleSaveButton = () => {
    console.log('[EXPENSE FORM] Save button pressed');
    handleSubmit(
      (data) => {
        console.log('[EXPENSE FORM] Form validation passed, calling onSubmit');
        onSubmit(data);
      },
      (errors) => {
        console.error('[EXPENSE FORM] Form validation failed:', errors);
        toast.error(t('pleaseFixValidationErrors'));
      },
    )();
  };

  /**
   * Handle OCR scanning of receipt after image upload
   */
  const handleScanReceipt = async (imageUrl: string) => {
    let toastId: string | number | undefined;
    try {
      toastId = toast.loading(t('extractingReceiptValues'));

      const extractedValues = await getReceiptValuesMutation.mutateAsync(
        imageUrl,
        {
          onError: (error) => {
            toast.error(t('errorGettingReceiptValues'), {
              description: error.response?.data.message || error.message,
            });
          },
        },
      );

      // Update form with extracted values
      if (extractedValues.merchant) {
        setValue('merchant', extractedValues.merchant);
      }
      if (extractedValues.date) {
        // Convert YYYY-MM-DD to ISO datetime (add time component)
        const dateStr = extractedValues.date;
        // Check if it's just a date or already has time
        const isoDateTime = dateStr.includes('T')
          ? dateStr
          : `${dateStr}T00:00:00.000Z`;
        setValue('date', isoDateTime);
      }
      if (
        extractedValues.total !== undefined &&
        extractedValues.total !== null
      ) {
        // Ensure it's a number or string, handle empty strings
        const totalValue =
          extractedValues.total === '' ? 0 : extractedValues.total;
        setValue('total', totalValue);
      }
      if (extractedValues.tax !== undefined && extractedValues.tax !== null) {
        // Ensure it's a number or string, handle empty strings
        const taxValue = extractedValues.tax === '' ? 0 : extractedValues.tax;
        setValue('tax', taxValue);
      }
      if (extractedValues.categoryId) {
        setValue('categoryId', extractedValues.categoryId);
        // Update subcategories list when category is set
        const category = categories.find(
          (cat) => cat.id === extractedValues.categoryId,
        );
        if (category) {
          setSubcategories(category.subcategories || []);
        }
      }
      if (extractedValues.subcategoryId) {
        setValue('subcategoryId', extractedValues.subcategoryId);
      }

      toast.success(t('receiptScannedSuccessfully'));
      toast.dismiss(toastId);
    } catch (error) {
      console.error('Error scanning receipt:', error);
      toast.error(t('errorGettingReceiptValues'));
      if (toastId) toast.dismiss(toastId);
    }
  };

  /**
   * Handle downloading receipt image
   */
  const handleDownloadReceipt = async () => {
    const imageUrl = watch('imageUrl');
    if (!imageUrl) {
      toast.error(t('noReceiptImageToDownload'));
      return;
    }

    try {
      const cloudinaryCloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
      let fullImageUrl = imageUrl;

      // Convert relative path to full Cloudinary URL if needed
      if (!imageUrl.startsWith('http')) {
        if (!cloudinaryCloudName) {
          toast.error('Cloudinary configuration error');
          return;
        }
        fullImageUrl = `https://res.cloudinary.com/${cloudinaryCloudName}/image/upload/${imageUrl}`;
      }

      if (Platform.OS === 'web') {
        // On web, open in new tab
        Linking.openURL(fullImageUrl);
        toast.success(t('receiptImageOpened'));
      } else {
        // On mobile, download and share using expo/fetch
        const loadingToast = toast.loading(t('downloadingReceipt'));
        const filename = imageUrl.split('/').pop() || 'receipt.jpg';
        const file = new File(Paths.cache, filename);

        try {
          // Delete existing file if it exists to avoid errors
          if (file.exists) {
            file.delete();
          }

          // Download using expo/fetch which returns bytes directly
          const response = await fetch(fullImageUrl);
          const bytes = await response.bytes();

          // Create and write the bytes to file
          await file.create();
          await file.write(bytes);

          toast.dismiss(loadingToast);

          const canShare = await Sharing.isAvailableAsync();
          if (canShare) {
            await Sharing.shareAsync(file.uri, {
              mimeType: 'image/jpeg',
              dialogTitle: t('receiptImage'),
            });
            toast.success(t('receiptDownloaded'));
          } else {
            toast.success(t('receiptSaved'));
          }
        } catch (error) {
          toast.dismiss(loadingToast);
          throw error;
        }
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error(t('errorDownloadingReceipt'));
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <CustomHeader
        title={expense.id === 'new' ? t('newExpense') : t('expenseDetails')}
        left={
          <HeaderButton onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </HeaderButton>
        }
        right={
          <View style={{ flexDirection: 'row', gap: 16 }}>
            {watch('imageUrl') && (
              <HeaderButton onPress={handleDownloadReceipt}>
                <Ionicons
                  name="download-outline"
                  size={24}
                  color={theme.primary}
                />
              </HeaderButton>
            )}

            <HeaderButton
              onPress={handleSaveButton}
              disabled={
                createMutation.isPending ||
                updateMutation.isPending ||
                deleteMutation.isPending
              }
            >
              <Ionicons name="save-outline" size={24} color={theme.primary} />
            </HeaderButton>

            {expense.id !== 'new' && (
              <DeleteConfirmationDialog onDelete={handleDelete}>
                <HeaderButton
                  onPress={() => {}}
                  disabled={
                    updateMutation.isPending || deleteMutation.isPending
                  }
                >
                  <Ionicons
                    name="trash-outline"
                    size={24}
                    color={theme.destructive}
                  />
                </HeaderButton>
              </DeleteConfirmationDialog>
            )}
          </View>
        }
      />
      <FormViewContainer>
        <Controller
          control={control}
          name="imageUrl"
          render={({ field: { onChange, value } }) => (
            <View style={{ gap: 8 }}>
              <ImageUploader
                ref={imageUploaderRef}
                value={value}
                onChange={onChange}
                folder="temp_receipts"
                label={t('receiptImage')}
                allowCamera={true}
                allowGallery={true}
                // error={!!errors.imageUrl}
                // errorMessage={getErrorMessage(errors.imageUrl)}
                // isScanning={isScanning}
              />
            </View>
          )}
        />

        <Controller
          control={control}
          name={'merchant'}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t('merchant')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={!!errors.merchant}
              errorMessage={getErrorMessage(errors.merchant)}
            />
          )}
        />

        <Controller
          control={control}
          name="date"
          render={({ field: { onChange, value } }) => (
            <DateTimePicker
              labelText={t('date')}
              error={!!errors.date}
              errorMessage={getErrorMessage(errors.date)}
              value={value ?? null}
              mode="date"
              onChange={onChange}
            />
          )}
        />

        <Controller
          control={control}
          name="total"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t('total')}
              value={value?.toString() || ''}
              onBlur={onBlur}
              onChangeText={(text) => {
                const num = parseFloat(text);
                onChange(isNaN(num) ? 0 : num);
              }}
              keyboardType="decimal-pad"
              error={!!errors.total}
              errorMessage={getErrorMessage(errors.total)}
            />
          )}
        />

        <Controller
          control={control}
          name="tax"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t('tax')}
              value={value?.toString() || ''}
              onBlur={onBlur}
              onChangeText={(text) => {
                const num = parseFloat(text);
                onChange(isNaN(num) ? 0 : num);
              }}
              keyboardType="decimal-pad"
              error={!!errors.tax}
              errorMessage={getErrorMessage(errors.tax)}
            />
          )}
        />

        <Controller
          control={control}
          name={'categoryId'}
          render={({ field: { onChange, value } }) => (
            <Select
              value={value}
              onValueChange={(id) => {
                onChange(id); // setValue("categoryId", id);
                const sub =
                  categories.find((cat) => cat.id === id)?.subcategories || [];
                setSubcategories(sub);
                setValue('subcategoryId', undefined);
              }}
              error={!!errors.categoryId}
              errorMessage={getErrorMessage(errors.categoryId)}
              options={categories.map((cat) => ({
                label: cat.name,
                value: cat.id,
              }))}
            >
              <SelectTrigger
                placeholder={t('selectACategory')}
                labelText={t('category')}
              />
              <SelectContent>
                <ScrollView>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} label={cat.name} value={cat.id} />
                  ))}
                </ScrollView>
              </SelectContent>
            </Select>
          )}
        />

        {subcategories && subcategories.length > 0 && (
          <Controller
            control={control}
            name={'subcategoryId'}
            render={({ field: { onChange, value } }) => (
              <Select
                value={value}
                onValueChange={onChange}
                options={subcategories.map((sub) => ({
                  label: sub.name,
                  value: sub.id,
                }))}
              >
                <SelectTrigger
                  placeholder={t('selectASubcategory')}
                  labelText={t('subcategory')}
                />
                <SelectContent>
                  <ScrollView>
                    {subcategories.map((sub) => (
                      <SelectItem
                        key={sub.id}
                        label={sub.name}
                        value={sub.id}
                      />
                    ))}
                  </ScrollView>
                </SelectContent>
              </Select>
            )}
          />
        )}

        <Controller
          control={control}
          name="notes"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t('notes')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={!!errors.notes}
              errorMessage={getErrorMessage(errors.notes)}
            />
          )}
        />
      </FormViewContainer>
    </View>
  );
}
