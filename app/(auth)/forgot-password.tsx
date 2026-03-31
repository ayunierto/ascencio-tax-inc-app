import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';
import Toast from 'react-native-toast-message';

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
          Toast.show({
            type: 'success',
            text1: 'Email sent',
            text2: data.message,
          });
          router.replace('/reset-password');
        },
        onError: (error) => {
          Toast.show({
            type: 'error',
            text1: 'Forgot Password Error',
            text2: error.response?.data.message || error.message,
          });
        },
      });
    },
    [forgotPassword],
  );

  const submitButtonText = useMemo(
    () => (isPending ? 'Sending...' : 'Send'),
    [isPending],
  );

  return (
    <AuthFormContainer maxWidth={360}>
      <Header
        title="Find your account"
        subtitle="Please enter your email or mobile number to search for your account."
      />

      <View style={authStyles.fieldsContainer}>
        <ErrorBox message={errors.root?.message} />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Email"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="done"
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

        <Button variant="outline" onPress={() => router.replace('/login')}>
          <ButtonText>Back</ButtonText>
        </Button>
      </View>
    </AuthFormContainer>
  );
};

export default ForgotPassword;
