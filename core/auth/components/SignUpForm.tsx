import { useRef } from 'react';
import { StyleSheet, TextInput, View, Platform } from 'react-native';
import { router } from 'expo-router';
import { toast } from 'sonner-native';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as AppleAuthentication from 'expo-apple-authentication';

import { useCountryCodes } from '@/core/hooks';
import { useAppleSignIn, useGoogleSignIn, useSignUp } from '../hooks';
import { SignUpRequest } from '@ascencio/shared';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/Button';
import { ErrorBox } from './ErrorBox';
import { Input } from '@/components/ui/Input';
import { ThemedText } from '@/components/ui/ThemedText';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/Select';
import { authStyles } from '../styles/authStyles';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { theme } from '@/components/ui/theme';

export default function SignUpForm() {
  const { t } = useTranslation();
  const { countryCodes } = useCountryCodes();

  const { errors, control, handleSubmit, signUp, setError } = useSignUp();
  const {
    signInWithGoogle,
    isLoading: isGoogleLoading,
    isReady: isGoogleReady,
  } = useGoogleSignIn();
  const {
    signInWithApple,
    isLoading: isAppleLoading,
    isAvailable: isAppleAvailable,
  } = useAppleSignIn();
  const isIOS = Platform.OS === 'ios';
  const canShowNativeAppleButton = isIOS && isAppleAvailable;

  // Refs for input navigation
  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const onSignUp = async (request: SignUpRequest) => {
    await signUp.mutateAsync(request, {
      onSuccess: () => {
        toast.success(t('signUpSuccess'));
        router.push('/verify-email');
      },
      onError: (error) => {
        const errorMessage =
          error.response?.data.message || error.message || t('signUpError');

        // Handle validation and conflict errors (400, 409)
        if (error.response?.status === 400 || error.response?.status === 409) {
          // Set error in root to display above the form
          setError('root', {
            type: 'manual',
            message: errorMessage,
          });
        } else {
          // For other errors, show toast
          toast.error('Sign up failed: ' + errorMessage);
        }
      },
    });
  };

  const handleGoogleSignUp = async () => {
    try {
      await signInWithGoogle();
      toast.success(t('signUpSuccess'));
      router.replace('/(app)/(dashboard)');
    } catch (error: unknown) {
      const errorMessageKey =
        error instanceof Error ? error.message : 'googleSignInError';
      toast.error(t(errorMessageKey));
      console.error('Google Sign-Up Error:', error);
    }
  };

  const handleAppleSignUp = async () => {
    try {
      const signedIn = await signInWithApple();

      if (!signedIn) {
        return;
      }

      toast.success(t('signUpSuccess'));
      router.replace('/(app)/(dashboard)');
    } catch (error: unknown) {
      const errorMessageKey =
        error instanceof Error ? error.message : 'appleSignInError';
      toast.error(t(errorMessageKey));
      console.error('Apple Sign-Up Error:', error);
    }
  };

  return (
    <>
      <View style={authStyles.fieldsContainer}>
        <ErrorBox message={getErrorMessage(errors.root)} />

        <Button
          variant="outline"
          disabled={
            isGoogleLoading ||
            isAppleLoading ||
            signUp.isPending ||
            !isGoogleReady
          }
          isLoading={isGoogleLoading}
          onPress={handleGoogleSignUp}
        >
          <ButtonIcon name="logo-google" />
          <ButtonText>{t('signUpWithGoogle')}</ButtonText>
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
            onPress={handleAppleSignUp}
          />
        ) : (
          <Button
            variant="outline"
            disabled={isAppleLoading || signUp.isPending || !isIOS}
            isLoading={isAppleLoading}
            onPress={handleAppleSignUp}
          >
            <ButtonIcon name="logo-apple" />
            <ButtonText>
              {isIOS ? t('continueWithApple') : t('appleSignInOnlyIOS')}
            </ButtonText>
          </Button>
        )}

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <ThemedText style={styles.dividerText}>
            {t('orContinueWith')}
          </ThemedText>
          <View style={styles.dividerLine} />
        </View>

        <Controller
          control={control}
          name="firstName"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t('firstName')}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              autoCapitalize="words"
              autoComplete="name"
              returnKeyType="next"
              onSubmitEditing={() => lastNameRef.current?.focus()}
              blurOnSubmit={false}
              error={!!errors.firstName}
              errorMessage={getErrorMessage(errors.firstName)}
            />
          )}
        />

        <Controller
          control={control}
          name="lastName"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              ref={lastNameRef}
              label={t('lastName')}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              autoCapitalize="words"
              autoComplete="name-family"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              blurOnSubmit={false}
              errorMessage={getErrorMessage(errors.lastName)}
              error={!!errors.lastName}
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              ref={emailRef}
              label={t('email')}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="next"
              onSubmitEditing={() => phoneRef.current?.focus()}
              blurOnSubmit={false}
              errorMessage={getErrorMessage(errors.email)}
              error={!!errors.email}
            />
          )}
        />

        <View style={authStyles.phoneContainer}>
          <Controller
            control={control}
            name={'countryCode'}
            render={({ field: { onChange, value } }) => (
              <Select
                value={value}
                onValueChange={onChange}
                options={countryCodes}
              >
                <SelectTrigger placeholder={t('selectYourCountry')} />
                <SelectContent>
                  {countryCodes.map((opt) => (
                    <SelectItem
                      key={opt.value + opt.label}
                      label={opt.label}
                      value={opt.value}
                    />
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          <Controller
            control={control}
            name="phoneNumber"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                ref={phoneRef}
                label={t('phone')}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                keyboardType="phone-pad"
                autoCapitalize="none"
                autoComplete="tel"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                blurOnSubmit={false}
                rootStyle={authStyles.phoneInput}
                errorMessage={getErrorMessage(errors.phoneNumber)}
                error={!!errors.phoneNumber}
              />
            )}
          />
        </View>

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              ref={passwordRef}
              label={t('password')}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              autoCapitalize="none"
              secureTextEntry
              placeholder="Password"
              returnKeyType="next"
              onSubmitEditing={() => confirmPasswordRef.current?.focus()}
              blurOnSubmit={false}
              errorMessage={getErrorMessage(errors.password)}
              error={!!errors.password}
            />
          )}
        />
      </View>

      <Button
        disabled={signUp.isPending}
        isLoading={signUp.isPending}
        onPress={handleSubmit(onSignUp)}
      >
        <ButtonText>
          {signUp.isPending ? t('creatingAccount') : t('createAccount')}
        </ButtonText>
      </Button>
    </>
  );
}

const styles = StyleSheet.create({
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
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
