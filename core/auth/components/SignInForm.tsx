import React, { useRef } from 'react';
import { TextInput, View, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner-native';
import * as AppleAuthentication from 'expo-apple-authentication';

import { SignInRequest } from '@ascencio/shared';
import { useAppleSignIn, useGoogleSignIn, useSignIn } from '../hooks';
import { ErrorBox } from './ErrorBox';
import { Input } from '@/components/ui/Input';
import { ThemedText } from '@/components/ui/ThemedText';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/Button';
import { authStyles } from '../styles/authStyles';
import { resendCode } from '../actions';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { theme } from '@/components/ui/theme';

export const SignInForm = () => {
  const { t } = useTranslation();
  const { control, handleSubmit, formErrors, isPending, setError, signIn } =
    useSignIn();
  const {
    signInWithGoogle,
    isLoading: isGoogleLoading,
    isReady: isGoogleReady,
    // error: googleError,
  } = useGoogleSignIn();
  const {
    signInWithApple,
    isLoading: isAppleLoading,
    isAvailable: isAppleAvailable,
  } = useAppleSignIn();
  const isIOS = Platform.OS === 'ios';
  const canShowNativeAppleButton = isIOS && isAppleAvailable;

  const passwordInputRef = useRef<TextInput>(null);

  const onForgotPassword = () => {
    if (!isPending) {
      router.push('/forgot-password');
    }
  };

  const onSignIn = (values: SignInRequest) => {
    signIn.mutateAsync(values, {
      onSuccess: () => {
        toast.success(t('signInSuccess'));
        router.replace('/(app)/(dashboard)');
      },
      onError: (error, variables) => {
        // If the response indicates that the email is not verified,
        // redirect to the verification page
        if (error.response?.data.message === 'emailNotVerified') {
          toast.info(
            t(error.response?.data.message || 'Please verify your email.'),
          );
          resendCode(variables.email);
          router.push('/verify-email');
          return;
        }

        // Handle 401 Unauthorized errors (incorrect credentials)
        const errorMessageKey =
          error.response?.data.message ||
          error.message ||
          'An unexpected error occurred.';

        if (error.response?.status === 401) {
          // Set error in root to display above the form
          setError('root', {
            type: 'manual',
            message: t(errorMessageKey),
          });
        } else {
          // For other errors, show toast
          toast.error(t(errorMessageKey));
        }
      },
    });
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      toast.success(t('signInSuccess'));
      router.replace('/(app)/(dashboard)');
    } catch (error: unknown) {
      const errorMessageKey =
        error instanceof Error ? error.message : 'googleSignInError';
      toast.error(t(errorMessageKey));
      console.error('Google Sign-In Error:', error);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      const signedIn = await signInWithApple();

      if (!signedIn) {
        return;
      }

      toast.success(t('signInSuccess'));
      router.replace('/(app)/(dashboard)');
    } catch (error: unknown) {
      const errorMessageKey =
        error instanceof Error ? error.message : 'appleSignInError';
      toast.error(t(errorMessageKey));
      console.error('Apple Sign-In Error:', error);
    }
  };

  return (
    <>
      <View style={authStyles.fieldsContainer}>
        <ErrorBox message={formErrors.root?.message} />

        {/* Google Sign-In Button */}
        <Button
          variant='outline'
          disabled={isGoogleLoading || isAppleLoading || isPending || !isGoogleReady}
          isLoading={isGoogleLoading}
          onPress={handleGoogleSignIn}
        >
          <ButtonIcon name='logo-google' />
          <ButtonText>{t('continueWithGoogle')}</ButtonText>
        </Button>

        {/* Apple Sign-In Button */}
        {canShowNativeAppleButton ? (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={
              AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
            }
            buttonStyle={
              AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
            }
            cornerRadius={8}
            style={styles.appleButton}
            onPress={handleAppleSignIn}
          />
        ) : (
          <Button
            variant='outline'
            disabled={isAppleLoading || isPending || !isIOS}
            isLoading={isAppleLoading}
            onPress={handleAppleSignIn}
          >
            <ButtonIcon name='logo-apple' />
            <ButtonText>
              {isIOS ? t('continueWithApple') : t('appleSignInOnlyIOS')}
            </ButtonText>
          </Button>
        )}

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <ThemedText style={styles.dividerText}>
            {t('orContinueWith')}
          </ThemedText>
          <View style={styles.dividerLine} />
        </View>

        <Controller
          control={control}
          name='email'
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              leadingIcon='at-outline'
              label={t('email')}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              keyboardType='email-address'
              autoCapitalize='none'
              autoComplete='email'
              returnKeyType='next'
              onSubmitEditing={() => passwordInputRef.current?.focus()}
              error={!!formErrors.email}
              errorMessage={getErrorMessage(formErrors.email)}
            />
          )}
        />

        <Controller
          control={control}
          name='password'
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              ref={passwordInputRef}
              leadingIcon='lock-closed-outline'
              label={t('password')}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              secureTextEntry={true}
              autoComplete='password'
              autoCapitalize='none'
              returnKeyType='done'
              onSubmitEditing={handleSubmit(onSignIn)}
              error={!!formErrors.password}
              errorMessage={getErrorMessage(formErrors.password)}
            />
          )}
        />
      </View>

      <ThemedText style={authStyles.linkText} onPress={onForgotPassword}>
        {t('forgotPassword')}
      </ThemedText>

      <Button
        disabled={isPending}
        onPress={handleSubmit(onSignIn)}
        isLoading={isPending}
      >
        <ButtonText>{isPending ? t('signingIn') : t('signIn')}</ButtonText>
      </Button>
    </>
  );
};

const styles = StyleSheet.create({
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.border,
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 14,
    color: theme.muted,
  },
  appleButton: {
    width: '100%',
    height: 50,
  },
});
