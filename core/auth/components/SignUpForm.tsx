import { useMemo, useRef } from 'react';
import { FlatList, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { toast } from 'sonner-native';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useCountryCodes } from '@/core/hooks';
import { useSignUp } from '../hooks';
import { SignUpRequest, parseZodIssueMessage } from '@ascencio/shared';
import { Button, ButtonText } from '@/components/ui/Button';
import { ErrorBox } from './ErrorBox';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/Select';
import { authStyles } from '../styles/authStyles';
import { getErrorMessage } from '@/utils/getErrorMessage';

export default function SignUpForm() {
  const { t } = useTranslation();
  const { countryCodes } = useCountryCodes();

  const { errors, control, handleSubmit, signUp, setError } = useSignUp();

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

  return (
    <>
      <View style={authStyles.fieldsContainer}>
        <ErrorBox message={getErrorMessage(errors.root)} />

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
