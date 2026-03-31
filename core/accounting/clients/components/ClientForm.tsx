import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';
import { Ionicons } from '@expo/vector-icons';

import {
  Client,
  CreateClientRequest,
  createClientSchema,
} from '@ascencio/shared';
import { Input } from '@/components/ui/Input';
import { getErrorMessage } from '@/utils/getErrorMessage';
import {
  Button,
  ButtonIcon,
  theme,
  CustomHeader,
  HeaderButton,
} from '@/components/ui';
import {
  createClientMutation,
  deleteClientMutation,
  updateClientMutation,
} from '../hooks';
import { DeleteConfirmationDialog } from '@/core/components';

interface ClientFormProps {
  client: Client;
}

export const ClientForm = ({ client }: ClientFormProps) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateClientRequest>({
    resolver: zodResolver(createClientSchema),
    defaultValues: client,
  });

  const createMutation = createClientMutation();
  const updateMutation = updateClientMutation();
  const deleteMutation = deleteClientMutation();

  const onSubmit = async (values: CreateClientRequest) => {
    console.log('[CLIENT FORM] onSubmit called with values:', values);
    console.log('[CLIENT FORM] Client ID:', values.id);
    console.log('[CLIENT FORM] Is update?', values.id !== 'new');

    try {
      if (values.id !== 'new') {
        console.log('[CLIENT FORM] Updating client...');
        const result = await updateMutation.mutateAsync(values);
        console.log('[CLIENT FORM] Update result:', result);
        console.log('[CLIENT FORM] Showing success toast');
        toast.success(t('clientUpdatedSuccessfully'));
        console.log('[CLIENT FORM] Navigating back');
        setTimeout(() => router.back(), 500);
      } else {
        console.log('[CLIENT FORM] Creating client...');
        const result = await createMutation.mutateAsync(values);
        console.log('[CLIENT FORM] Create result:', result);
        console.log('[CLIENT FORM] Showing success toast');
        toast.success(t('clientCreatedSuccessfully'));
        console.log('[CLIENT FORM] Navigating back');
        setTimeout(() => router.back(), 500);
      }
    } catch (error: any) {
      console.error('[CLIENT FORM] Error saving client:', error);
      console.error('[CLIENT FORM] Error response:', error?.response?.data);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          t('unknownErrorOccurred'),
      );
    }
  };

  const handleDeleteClient = async () => {
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(client.id, {
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
      console.error('Error deleting client:', error);
      toast.error(t('unknownErrorOccurred'));
      setIsDeleting(false);
    }
  };

  const handleSaveButton = () => {
    console.log('[CLIENT FORM] Save button pressed');
    handleSubmit(
      (data) => {
        console.log('[CLIENT FORM] Form validation passed, calling onSubmit');
        onSubmit(data);
      },
      (errors) => {
        console.error('[CLIENT FORM] Form validation failed:', errors);
        toast.error(t('pleaseFixValidationErrors'));
      },
    )();
  };

  return (
    <View style={{ flex: 1 }}>
      <CustomHeader
        title={client.id === 'new' ? t('newClient') : t('clientDetails')}
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
                createMutation.isPending ||
                updateMutation.isPending ||
                deleteMutation.isPending
              }
            >
              <Ionicons name="save-outline" size={24} color={theme.primary} />
            </HeaderButton>

            {client.id !== 'new' && (
              <DeleteConfirmationDialog onDelete={handleDeleteClient}>
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
              name="fullName"
              render={({ field: { onChange, value } }) => (
                <Input
                  onChangeText={onChange}
                  value={value}
                  label={t('fullName')}
                  error={!!errors.fullName}
                  errorMessage={getErrorMessage(errors.fullName)}
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

            <View style={{ flexDirection: 'row', gap: 16 }}>
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
                    style={{ flex: 1 }}
                  />
                )}
              />

              <Controller
                control={control}
                name="country"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label={t('country')}
                    onChangeText={onChange}
                    value={value}
                    error={!!errors.country}
                    errorMessage={getErrorMessage(errors.country)}
                    style={{ flex: 1 }}
                  />
                )}
              />
            </View>

            {/* Campos opcionales para individuos */}
            <Controller
              control={control}
              name="sin"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t('sin')}
                  onChangeText={onChange}
                  value={value}
                  helperText="XXX-XXX-XXX"
                  error={!!errors.sin}
                  errorMessage={getErrorMessage(errors.sin)}
                />
              )}
            />

            {/* Campo opcional para empresas */}
            <Controller
              control={control}
              name="businessNumber"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t('businessNumber')}
                  onChangeText={onChange}
                  value={value}
                  helperText="123456789RC0001"
                  error={!!errors.businessNumber}
                  errorMessage={getErrorMessage(errors.businessNumber)}
                />
              )}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
