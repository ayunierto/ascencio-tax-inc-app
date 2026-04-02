import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { toast } from 'sonner-native';

import { Button, ButtonText } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AuthFormContainer } from '@/core/auth/components/AuthFormContainer';
import { ErrorBox } from '@/core/auth/components/ErrorBox';
import Header from '@/core/auth/components/Header';
import { useForgotPasswordMutation } from '@/core/auth/hooks/useForgotPasswordMutation';
import { useAuthStore } from '@/core/auth/store/useAuthStore';
import { authStyles } from '@/core/auth/styles/authStyles';
import { ForgotPasswordRequest, forgotPasswordSchema } from '@ascencio/shared';

const ForgotPassword = () => {
  const { t } = useTranslation();
  const { tempEmail } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordRequest>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: tempEmail || '',
    },
  });

  const { mutate: forgotPassword, isPending } = useForgotPasswordMutation();

  const handleForgotPassword = useCallback(
    (values: ForgotPasswordRequest) => {
      forgotPassword(values, {
        onSuccess: (data) => {
          toast.success(t('emailSent'), {
            description: data.message,
          });
          router.replace('/reset-password');
        },
        onError: (error) => {
          toast.error(error.response?.data.message || error.message, {
            description: t('forgotPasswordError'),
          });
        },
      });
    },
    [forgotPassword, t],
  );

  const submitButtonText = useMemo(
    () => (isPending ? t('sending') : t('send')),
    [isPending, t],
  );

  return (
    <AuthFormContainer maxWidth={360}>
      <Header
        title={t('findYourAccount')}
        subtitle={t('findYourAccountSubtitle')}
      />

      <View style={authStyles.fieldsContainer}>
        <ErrorBox message={errors.root?.message} />

        <Controller
          control={control}
          name='email'
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t('email')}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder={t('email')}
              autoCapitalize='none'
              keyboardType='email-address'
              returnKeyType='done'
              onSubmitEditing={handleSubmit(handleForgotPassword)}
              errorMessage={errors.email?.message}
              error={!!errors.email}
            />
          )}
        />
      </View>

      <View style={authStyles.buttonGroup}>
        <Button
          disabled={isPending}
          isLoading={isPending}
          onPress={handleSubmit(handleForgotPassword)}
        >
          <ButtonText>{submitButtonText}</ButtonText>
        </Button>

        <Button variant='outline' onPress={() => router.replace('/login')}>
          <ButtonText>{t('back')}</ButtonText>
        </Button>
      </View>
    </AuthFormContainer>
  );
};

export default ForgotPassword;
