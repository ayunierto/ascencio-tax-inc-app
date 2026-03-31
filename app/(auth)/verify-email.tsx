import React, { useCallback, useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button, ButtonText } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AuthFormContainer } from '@/core/auth/components/AuthFormContainer';
import { ErrorBox } from '@/core/auth/components/ErrorBox';
import Header from '@/core/auth/components/Header';
import { useResendEmailCodeMutation } from '@/core/auth/hooks/useResendEmailCodeMutation';
import { useTimer } from '@/core/auth/hooks/useTimer';
import { useVerifyEmailMutation } from '@/core/auth/hooks/useVerifyEmailMutation';
import { toast } from 'sonner-native';

import { useAuthStore } from '@/core/auth/store/useAuthStore';
import { authStyles } from '@/core/auth/styles/authStyles';
import {
  VerifyEmailCodeRequest,
  verifyEmailCodeSchema,
} from '@ascencio/shared';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { useTranslation } from 'react-i18next';

const VerifyEmail = () => {
  const { tempEmail } = useAuthStore();
  const { timeRemaining, isRunning, startTimer, resetTimer } = useTimer(30);
  const { t } = useTranslation();

  useEffect(() => {
    startTimer();

    return () => {
      resetTimer();
    };
  }, [resetTimer, startTimer]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    resetField,
    setError,
  } = useForm<VerifyEmailCodeRequest>({
    resolver: zodResolver(verifyEmailCodeSchema),
    defaultValues: {
      email: tempEmail,
      code: '',
    },
  });

  const { mutateAsync: verifyEmail, isPending } = useVerifyEmailMutation();

  const handleEmailVerification = useCallback(
    async (data: VerifyEmailCodeRequest) => {
      await verifyEmail(data, {
        onSuccess: () => {
          resetTimer();
          router.replace('/(app)/(dashboard)');
          toast.success(t('verifySuccess'));
        },
        onError: (error) => {
          toast.error(
            t(error.response?.data.message || error.message || 'unknownError'),
          );
          setError('code', {
            type: 'manual',
            message: t(
              error.response?.data.message || error.message || 'unknownError',
            ),
          });
          resetTimer();
          startTimer();
          resetField('code');
        },
      });
    },
    [verifyEmail, resetTimer, t, setError, startTimer, resetField],
  );

  const { mutate: resendEmailCode, isPending: isLoadingResend } =
    useResendEmailCodeMutation();

  const onResendVerificationCode = useCallback(() => {
    if (tempEmail) {
      if (isRunning) return;
      resendEmailCode(tempEmail);

      resetTimer();
      startTimer();
    }
  }, [tempEmail, isRunning, resendEmailCode, resetTimer, startTimer]);

  const resendButtonText = useMemo(
    () =>
      timeRemaining === 0
        ? t('resendCode')
        : t('resendIn', { seconds: timeRemaining }),
    [t, timeRemaining],
  );

  if (!tempEmail) {
    return <Redirect href={'/'} />;
  }

  return (
    <AuthFormContainer>
      <Header title={t('otpScreenTitle')} subtitle={t('otpScreenSubtitle')} />

      <View style={authStyles.fieldsContainer}>
        <ErrorBox message={errors.root?.message || errors.email?.message} />

        <Controller
          control={control}
          name='code'
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t('verificationCode')}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              keyboardType='numeric'
              autoCapitalize='none'
              autoComplete='off'
              autoCorrect={false}
              maxLength={6}
              returnKeyType='done'
              onSubmitEditing={handleSubmit(handleEmailVerification)}
              error={!!errors.code}
              errorMessage={getErrorMessage(errors.code)}
            />
          )}
        />
      </View>

      <View style={authStyles.buttonGroup}>
        <Button
          disabled={isPending}
          onPress={handleSubmit(handleEmailVerification)}
          isLoading={isPending}
        >
          <ButtonText>{isPending ? t('verifying') : t('verify')}</ButtonText>
        </Button>

        <Button
          disabled={isLoadingResend || isRunning}
          onPress={onResendVerificationCode}
          variant='outline'
        >
          <ButtonText>{resendButtonText}</ButtonText>
        </Button>
      </View>
    </AuthFormContainer>
  );
};

export default VerifyEmail;
