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
import Loader from '@/components/Loader';

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
  theme,
  ImageUploader,
  ImageUploaderRef,
  CustomHeader,
  HeaderButton,
} from '@/components/ui';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { DeleteConfirmationDialog, FormViewContainer } from '@/core/components';
import { useReceiptPipeline } from '@/core/accounting/expenses/hooks/useReceiptPipeline';
import {
  canAnalyzeReceiptReference,
  resolveReceiptImageUrl,
} from '@/core/accounting/expenses/utils/receipt-image.utils';
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
  autoOpenCameraOnMount?: boolean;
}

export default function ExpenseForm({
  expense,
  categories,
  autoOpenCameraOnMount = false,
}: ExpenseFormProps) {
  const { t } = useTranslation();
  const imageUploaderRef = useRef<ImageUploaderRef>(null);
  const hasOpenedCameraRef = useRef(false);
  const [isBootstrappingCamera, setIsBootstrappingCamera] = useState(
    autoOpenCameraOnMount,
  );
  const lastScannedImageRef = useRef<string | undefined>(undefined);
  const hasAutoScannedRef = useRef<boolean>(false);
  const [totalInput, setTotalInput] = useState<string>(
    expense.total?.toString() || '',
  );
  const [taxInput, setTaxInput] = useState<string>(
    expense.tax?.toString() || '',
  );
  const [subcategories, setSubcategories] = useState<Subcategory[]>(
    categories.find((cat) => cat.id === expense.category?.id)?.subcategories ||
      [],
  );

  const sanitizeDecimalInput = (text: string) => {
    const normalized = text.replace(',', '.').replace(/[^\d.]/g, '');
    const [integerPart, ...decimalParts] = normalized.split('.');

    return decimalParts.length > 0
      ? `${integerPart}.${decimalParts.join('')}`
      : integerPart;
  };

  const { getReceiptValuesMutation } = useReceiptPipeline();
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
    setTotalInput(expense.total?.toString() || '');
    setTaxInput(expense.tax?.toString() || '');
  }, [expense, reset]);

  React.useEffect(() => {
    if (!autoOpenCameraOnMount || hasOpenedCameraRef.current) {
      return;
    }

    hasOpenedCameraRef.current = true;
    const bootstrapTimeout = setTimeout(() => {
      setIsBootstrappingCamera(false);
    }, 1500);

    const timeout = setTimeout(async () => {
      try {
        await imageUploaderRef.current?.selectFromCamera();
      } catch (error) {
        console.error('Error opening camera from create flow:', error);
      } finally {
        clearTimeout(bootstrapTimeout);
        setIsBootstrappingCamera(false);
      }
    }, 0);

    return () => {
      clearTimeout(timeout);
      clearTimeout(bootstrapTimeout);
    };
  }, [autoOpenCameraOnMount]);

  const createMutation = createExpenseMutation();
  const updateMutation = updateExpenseMutation();
  const deleteMutation = deleteExpenseMutation();
  const goToExpensesList = () => router.replace('/(app)/expenses/(tabs)');

  const watchedImageUrl = watch('imageUrl');
  const previousImageUrlRef = useRef<string | undefined>(watchedImageUrl);

  const onSubmit = async (data: CreateExpenseInput) => {
    try {
      // Validate and transform data through schema (converts strings to numbers)
      const validatedData = createExpenseSchema.parse(data);

      if (validatedData.id && validatedData.id !== 'new') {
        await updateMutation.mutateAsync(validatedData);
        // Mark image as saved to prevent cleanup
        imageUploaderRef.current?.markAsSaved();
        toast.success(t('expenseUpdatedSuccessfully'));
        setTimeout(() => router.back(), 500);
      } else {
        await createMutation.mutateAsync(validatedData);
        // Mark image as saved to prevent cleanup
        imageUploaderRef.current?.markAsSaved();
        toast.success(t('expenseCreatedSuccessfully'));
        setTimeout(goToExpensesList, 500);
      }
    } catch (error: any) {
      console.error('Error saving expense:', error);
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
    handleSubmit(
      (data) => {
        onSubmit(data);
      },
      (errors) => {
        console.error('Form validation failed:', errors);
        toast.error(t('pleaseFixValidationErrors'));
      },
    )();
  };

  /**
   * Handle OCR scanning of receipt after image upload
   */
  const handleScanReceipt = React.useCallback(
    async (imageRef: string) => {
      let toastId: string | number | undefined;
      try {
        const imageUrl = resolveReceiptImageUrl(imageRef);
        if (!imageUrl) {
          toast.error('Cloudinary configuration error');
          return;
        }

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
          setTotalInput(totalValue.toString());
        }
        if (extractedValues.tax !== undefined && extractedValues.tax !== null) {
          // Ensure it's a number or string, handle empty strings
          const taxValue = extractedValues.tax === '' ? 0 : extractedValues.tax;
          setValue('tax', taxValue);
          setTaxInput(taxValue.toString());
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
    },
    [categories, getReceiptValuesMutation, setValue, t],
  );

  // Auto scan when a new temp receipt image is uploaded (form value)
  React.useEffect(() => {
    const previousImageUrl = previousImageUrlRef.current;
    const currentImageUrl = watchedImageUrl;

    // Update the previous value for next comparison
    previousImageUrlRef.current = currentImageUrl;

    // Don't scan if no image
    if (!currentImageUrl) return;

    // Don't scan if image reference cannot be resolved for OCR.
    if (!canAnalyzeReceiptReference(currentImageUrl)) return;

    const isInitialRender = previousImageUrl === currentImageUrl;
    const shouldAutoScanInitialCreate =
      isInitialRender &&
      expense.id === 'new' &&
      !hasAutoScannedRef.current &&
      !!currentImageUrl;

    // Don't scan if it's the same image we already scanned
    if (lastScannedImageRef.current === currentImageUrl) return;

    // CRITICAL: Don't scan on initial mount - only when image actually changes
    // This prevents scanning when opening an existing expense from the list
    if (isInitialRender && !shouldAutoScanInitialCreate) return;

    // Don't scan if this is the first render and image was already there
    // (opening existing expense with image)
    if (previousImageUrl === undefined && expense.imageUrl === currentImageUrl)
      return;

    // Mark this image as scanned
    lastScannedImageRef.current = currentImageUrl;
    hasAutoScannedRef.current = true;

    handleScanReceipt(currentImageUrl);
  }, [watchedImageUrl, expense.imageUrl, expense.id, handleScanReceipt]);

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
      const fullImageUrl = resolveReceiptImageUrl(imageUrl);
      if (!fullImageUrl) {
        toast.error('Cloudinary configuration error');
        return;
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
      <View
        style={{
          flex: 1,
          opacity: isBootstrappingCamera ? 0 : 1,
        }}
        pointerEvents={isBootstrappingCamera ? 'none' : 'auto'}
      >
        <CustomHeader
          title={expense.id === 'new' ? t('newExpense') : t('expenseDetails')}
          left={
            <HeaderButton
              onPress={() => {
                if (expense.id === 'new') {
                  goToExpensesList();
                  return;
                }
                router.back();
              }}
            >
              <Ionicons name='arrow-back' size={24} color='#ffffff' />
            </HeaderButton>
          }
          right={
            <View style={{ flexDirection: 'row', gap: 16 }}>
              {watch('imageUrl') && (
                <HeaderButton onPress={handleDownloadReceipt}>
                  <Ionicons
                    name='download-outline'
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
                <Ionicons name='save-outline' size={24} color={theme.primary} />
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
                      name='trash-outline'
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
            name='imageUrl'
            render={({ field: { onChange, value } }) => (
              <View style={{ gap: 8 }}>
                <ImageUploader
                  ref={imageUploaderRef}
                  value={value}
                  onChange={onChange}
                  folder='temp_receipts'
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
            name='date'
            render={({ field: { onChange, value } }) => (
              <DateTimePicker
                labelText={t('date')}
                error={!!errors.date}
                errorMessage={getErrorMessage(errors.date)}
                value={value ?? null}
                mode='date'
                onChange={onChange}
              />
            )}
          />

          <Controller
            control={control}
            name='total'
            render={({ field: { onChange, onBlur } }) => (
              <Input
                label={t('total')}
                value={totalInput}
                onBlur={() => {
                  onBlur();
                  if (!totalInput) {
                    onChange(0);
                    return;
                  }

                  const num = Number(totalInput);
                  if (Number.isNaN(num)) {
                    onChange(0);
                    setTotalInput('');
                    return;
                  }

                  onChange(num);
                  setTotalInput(num.toString());
                }}
                onChangeText={(text) => {
                  const sanitized = sanitizeDecimalInput(text);
                  setTotalInput(sanitized);

                  if (!sanitized || sanitized.endsWith('.')) return;

                  const num = Number(sanitized);
                  if (!Number.isNaN(num)) {
                    onChange(num);
                  }
                }}
                keyboardType='decimal-pad'
                error={!!errors.total}
                errorMessage={getErrorMessage(errors.total)}
              />
            )}
          />

          <Controller
            control={control}
            name='tax'
            render={({ field: { onChange, onBlur } }) => (
              <Input
                label={t('tax')}
                value={taxInput}
                onBlur={() => {
                  onBlur();
                  if (!taxInput) {
                    onChange(0);
                    return;
                  }

                  const num = Number(taxInput);
                  if (Number.isNaN(num)) {
                    onChange(0);
                    setTaxInput('');
                    return;
                  }

                  onChange(num);
                  setTaxInput(num.toString());
                }}
                onChangeText={(text) => {
                  const sanitized = sanitizeDecimalInput(text);
                  setTaxInput(sanitized);

                  if (!sanitized || sanitized.endsWith('.')) return;

                  const num = Number(sanitized);
                  if (!Number.isNaN(num)) {
                    onChange(num);
                  }
                }}
                keyboardType='decimal-pad'
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
                    categories.find((cat) => cat.id === id)?.subcategories ||
                    [];
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
                      <SelectItem
                        key={cat.id}
                        label={cat.name}
                        value={cat.id}
                      />
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
            name='notes'
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
      {isBootstrappingCamera && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
          }}
        >
          <Loader message={t('loading')} />
        </View>
      )}
    </View>
  );
}
