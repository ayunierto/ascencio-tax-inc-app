import { zodResolver } from '@hookform/resolvers/zod';
import { Redirect, router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { TextInput, View } from 'react-native';

import { Button, ButtonText } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AuthFormContainer } from '@/core/auth/components/AuthFormContainer';
import { ErrorBox } from '@/core/auth/components/ErrorBox';
import Header from '@/core/auth/components/Header';
import {
  useResendResetPasswordMutation,
  useResetPasswordMutation,
  useTimer,
} from '@/core/auth/hooks';
import { useAuthStore } from '@/core/auth/store/useAuthStore';
import { authStyles } from '@/core/auth/styles/authStyles';
import { ResetPasswordRequest, resetPasswordSchema } from '@ascencio/shared';
import { toast } from 'sonner-native';

const VerifyCode = () => {
  const { tempEmail } = useAuthStore();
  const { isRunning, timeRemaining, startTimer, resetTimer } = useTimer(30);

  const newPasswordRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ResetPasswordRequest>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    setValue('email', tempEmail || '');
    startTimer();
    return () => {
      resetTimer();
    };
  }, [resetTimer, setValue, startTimer, tempEmail]);

  const { mutate: verifyEmail, isPending } = useResetPasswordMutation();
  const { mutate: resendResetPasswordCode } = useResendResetPasswordMutation();

  const handleEmailVerification = useCallback(
    (data: ResetPasswordRequest) => {
      verifyEmail(data, {
        onSuccess: () => {
          toast.success('Password Reset Successfully', {
            description: 'Your password has been changed successfully.',
          });
          router.replace('/login');
        },
        onError: (error) => {
          toast.error('Password Reset Error', {
            description: error.response?.data.message || error.message,
          });
        },
      });
    },
    [verifyEmail],
  );

  const handleResendPasswordCode = useCallback(() => {
    if (isRunning) return;
    resendResetPasswordCode(tempEmail || '', {
      onSuccess: () => {
        resetTimer();
        startTimer();
        toast.success('Code resent', {
          description: 'A new code has been sent to your email.',
        });
      },
    });
  }, [isRunning, resendResetPasswordCode, tempEmail, resetTimer, startTimer]);

  const submitButtonText = useMemo(
    () => (isPending ? 'Verifying...' : 'Verify'),
    [isPending],
  );

  if (!tempEmail) {
    return <Redirect href={'/login'} />;
  }

  // ...existing code...

  return (
    <AuthFormContainer>
      <Header
        title={'Change your password'}
        subtitle={
          'Please check your email for a message with your code. Your code is 6 numbers long.'
        }
      />

      <View style={authStyles.fieldsContainer}>
        <ErrorBox message={errors.root?.message} />

        <Controller
          control={control}
          name='code'
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label='Code'
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder='123456'
              keyboardType='numeric'
              autoCapitalize='none'
              autoComplete='off'
              autoCorrect={false}
              maxLength={6}
              returnKeyType='next'
              onSubmitEditing={() => newPasswordRef.current?.focus()}
              blurOnSubmit={false}
              error={!!errors.code}
              errorMessage={errors.code?.message || ''}
            />
          )}
        />

        <Controller
          control={control}
          name='newPassword'
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              ref={newPasswordRef}
              label='New Password'
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder='New Password'
              keyboardType='default'
              autoCapitalize='none'
              returnKeyType='done'
              onSubmitEditing={handleSubmit(handleEmailVerification)}
              error={!!errors.newPassword}
              errorMessage={errors.newPassword?.message || ''}
              secureTextEntry
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
          <ButtonText>{submitButtonText}</ButtonText>
        </Button>

        <Button
          disabled={isRunning}
          onPress={handleResendPasswordCode}
          variant='outline'
        >
          <ButtonText>
            {timeRemaining === 0
              ? 'Resend code'
              : `Resend in ${timeRemaining}s`}
          </ButtonText>
        </Button>
      </View>
    </AuthFormContainer>
  );
};

export default VerifyCode;
