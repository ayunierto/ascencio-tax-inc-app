import React, { useState, useRef } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';
import { Ionicons } from '@expo/vector-icons';

import {
  Company,
  CreateCompanyRequest,
  createCompanySchema,
} from '@ascencio/shared';
import { Input } from '@/components/ui/Input';
import { getErrorMessage } from '@/utils/getErrorMessage';
import {
  ImageUploader,
  theme,
  Button,
  ButtonIcon,
  ImageUploaderRef,
  CustomHeader,
  HeaderButton,
} from '@/components/ui';
import {
  createCompanyMutation,
  deleteCompanyMutation,
  updateCompanyMutation,
} from '../hooks';
import { DeleteConfirmationDialog } from '@/core/components';

interface CompanyFormProps {
  company: Company;
}

export const CompanyForm = ({ company }: CompanyFormProps) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [isDeleting, setIsDeleting] = useState(false);
  const imageUploaderRef = useRef<ImageUploaderRef>(null);

  // For existing companies, use logoUrl as the initial image value
  // For new companies, mediaToken will be undefined initially
  const initialMediaToken = company.id !== 'new' ? company.logoUrl : undefined;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCompanyRequest>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: {
      ...company,
      // Use logoUrl for display when editing existing company
      mediaToken: initialMediaToken,
    },
  });
  const createCompany = createCompanyMutation();
  const updateCompany = updateCompanyMutation();
  const deleteCompany = deleteCompanyMutation();

  const onSubmit = async (values: CreateCompanyRequest) => {
    console.log('[COMPANY FORM] onSubmit called with values:', values);
    console.log('[COMPANY FORM] Company ID:', values.id);
    console.log('[COMPANY FORM] Is update?', values.id !== 'new');

    // Only send mediaToken if it's a new temp upload (starts with temp_files/)
    // If it's the same as logoUrl, don't send it (no change)
    const mediaTokenToSend = values.mediaToken?.startsWith('temp_files/')
      ? values.mediaToken
      : undefined;

    const submitData = {
      ...values,
      mediaToken: mediaTokenToSend,
    };

    console.log('[COMPANY FORM] Submit data:', submitData);

    try {
      if (values.id !== 'new') {
        console.log('[COMPANY FORM] Updating company...');
        const result = await updateCompany.mutateAsync(submitData);
        console.log('[COMPANY FORM] Update result:', result);
        // Mark image as saved to prevent cleanup
        imageUploaderRef.current?.markAsSaved();
        console.log('[COMPANY FORM] Showing success toast');
        toast.success(t('companyUpdatedSuccessfully'));
        console.log('[COMPANY FORM] Navigating back');
        setTimeout(() => router.back(), 500);
      } else {
        console.log('[COMPANY FORM] Creating company...');
        const result = await createCompany.mutateAsync(submitData);
        console.log('[COMPANY FORM] Create result:', result);
        // Mark image as saved to prevent cleanup
        imageUploaderRef.current?.markAsSaved();
        console.log('[COMPANY FORM] Showing success toast');
        toast.success(t('companyCreatedSuccessfully'));
        console.log('[COMPANY FORM] Navigating back');
        setTimeout(() => router.back(), 500);
      }
    } catch (error: any) {
      console.error('[COMPANY FORM] Error saving company:', error);
      console.error('[COMPANY FORM] Error response:', error?.response?.data);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          t('unknownErrorOccurred'),
      );
    }
  };

  const handleDeleteCompany = async () => {
    setIsDeleting(true);
    try {
      await deleteCompany.mutateAsync(company.id, {
        onSuccess: () => {
          toast.success(t('deleteSuccess'));
          setTimeout(() => router.back(), 500);
        },
        onError: (error) => {
          toast.error(
            t(error.response?.data?.message || error.message || 'canNotDelete'),
          );
          setIsDeleting(false);
        },
      });
    } catch (error) {
      console.error('Error deleting company:', error);
      toast.error(t('unknownErrorOccurred'));
      setIsDeleting(false);
    }
  };

  const handleSaveButton = () => {
    console.log('[COMPANY FORM] Save button pressed');
    handleSubmit(
      (data) => {
        console.log('[COMPANY FORM] Form validation passed, calling onSubmit');
        onSubmit(data);
      },
      (errors) => {
        console.error('[COMPANY FORM] Form validation failed:', errors);
        toast.error(t('pleaseFixValidationErrors'));
      },
    )();
  };

  return (
    <View style={{ flex: 1 }}>
      <CustomHeader
        title={company.id === 'new' ? t('newCompany') : t('companyDetails')}
        left={
          <HeaderButton onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </HeaderButton>
        }
        right={
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <HeaderButton
              onPress={handleSaveButton}
              disabled={
                createCompany.isPending ||
                updateCompany.isPending ||
                deleteCompany.isPending
              }
            >
              <Ionicons name="save-outline" size={24} color={theme.primary} />
            </HeaderButton>

            {company.id !== 'new' && (
              <DeleteConfirmationDialog onDelete={handleDeleteCompany}>
                <HeaderButton
                  onPress={() => {}}
                  disabled={updateCompany.isPending || deleteCompany.isPending}
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 80}
      >
        <ScrollView
          style={{ padding: 16, paddingTop: 8 }}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ flex: 1, gap: 16 }}>
            <Controller
              control={control}
              name="mediaToken"
              render={({ field: { onChange, value } }) => (
                <ImageUploader
                  ref={imageUploaderRef}
                  value={value as string | undefined}
                  onChange={onChange}
                  folder="temp_files"
                  // label={t('companyLogo')}
                />
              )}
            />

            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <Input
                  onChangeText={onChange}
                  value={value}
                  label={t('name')}
                  error={!!errors.name}
                  errorMessage={getErrorMessage(errors.name)}
                />
              )}
            />

            <Controller
              control={control}
              name="legalName"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={`${t('legalName')}`}
                  onChangeText={onChange}
                  value={value}
                  error={!!errors.legalName}
                  errorMessage={getErrorMessage(errors.legalName)}
                />
              )}
            />

            <Controller
              control={control}
              name="businessNumber"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t('businessNumber')}
                  onChangeText={onChange}
                  value={value}
                  error={!!errors.businessNumber}
                  errorMessage={getErrorMessage(errors.businessNumber)}
                  helperText="(123456789RC0001)"
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t('email')}
                  onChangeText={onChange}
                  value={value}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={!!errors.email}
                  errorMessage={getErrorMessage(errors.email)}
                />
              )}
            />

            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t('phone')}
                  onChangeText={onChange}
                  value={value}
                  keyboardType="phone-pad"
                  error={!!errors.phone}
                  errorMessage={getErrorMessage(errors.phone)}
                />
              )}
            />

            <Controller
              control={control}
              name="address"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t('address')}
                  onChangeText={onChange}
                  value={value}
                  multiline
                  error={!!errors.address}
                  errorMessage={getErrorMessage(errors.address)}
                />
              )}
            />

            <View style={{ flexDirection: 'row', gap: 16 }}>
              <Controller
                control={control}
                name="city"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label={t('city')}
                    onChangeText={onChange}
                    value={value}
                    error={!!errors.city}
                    errorMessage={getErrorMessage(errors.city)}
                    style={{ flex: 1 }}
                  />
                )}
              />

              <Controller
                control={control}
                name="province"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label={t('province')}
                    onChangeText={onChange}
                    value={value}
                    error={!!errors.province}
                    errorMessage={getErrorMessage(errors.province)}
                    style={{ flex: 1 }}
                  />
                )}
              />
            </View>

            <Controller
              control={control}
              name="postalCode"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t('postalCode')}
                  onChangeText={onChange}
                  value={value}
                  error={!!errors.postalCode}
                  errorMessage={getErrorMessage(errors.postalCode)}
                />
              )}
            />

            <Controller
              control={control}
              name="payrollAccountNumber"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t('payrollAccountNumber')}
                  onChangeText={onChange}
                  value={value}
                  error={!!errors.payrollAccountNumber}
                  errorMessage={getErrorMessage(errors.payrollAccountNumber)}
                />
              )}
            />

            {/* <Button onPress={handleSubmit(onSubmit)}>
          <ButtonIcon name="save-outline" />
          <ButtonText>{t('createCompany')}</ButtonText>
        </Button> */}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
