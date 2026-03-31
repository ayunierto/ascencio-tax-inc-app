import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, ButtonIcon, ButtonText } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/Select';
import { theme, CustomHeader, HeaderButton } from '@/components/ui';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAuthStore } from '@/core/auth/store/useAuthStore';
import { useCountryCodes } from '@/core/hooks/useCountryCodes';
import useIPGeolocation from '@/core/hooks/useIPGeolocation';
import { useUpdateProfileMutation } from '@/core/user/hooks/useUpdateProfileMutation';
import { UpdateProfileRequest, updateProfileSchema } from '@ascencio/shared';
import { toast } from 'sonner-native';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '@/utils';
import { FormViewContainer } from '@/core/components';

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { countryCodes } = useCountryCodes();
  const [callingCode, setCallingCode] = useState<string | undefined>();
  const { t } = useTranslation();
  const { location } = useIPGeolocation();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<UpdateProfileRequest>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: user?.firstName,
      lastName: user?.lastName,
      phoneNumber: user?.phoneNumber || undefined,
      countryCode: user?.countryCode || callingCode || undefined,
    },
  });

  useEffect(() => {
    if (location && !('error' in location)) {
      setCallingCode(`+${location.location.calling_code}`);
      setValue('countryCode', `+${location.location.calling_code}`);
    }
  }, [location, setValue]);

  const updateProfile = useUpdateProfileMutation();

  const handleUpdateProfile = useCallback(
    async (values: UpdateProfileRequest) => {
      console.log('Updating profile with values:', values);
      await updateProfile.mutateAsync(values, {
        onSuccess: () => {
          toast.success(t('profileUpdateSuccess'));
        },
        onError: (error) => {
          toast.error(t('profileUpdateFailed'), {
            description:
              error.response?.data.message || t('profileUpdateErrorOccurred'),
          });
        },
      });
    },
    [updateProfile, t],
  );

  if (!user) {
    router.replace('/');
    return null;
  }

  return (
    <FormViewContainer>
      <CustomHeader
        title={t('myAccount')}
        left={
          <HeaderButton onPress={() => router.back()}>
            <Ionicons name='arrow-back' size={24} color='#ffffff' />
          </HeaderButton>
        }
        right={
          <HeaderButton
            onPress={handleSubmit(handleUpdateProfile)}
            disabled={updateProfile.isPending}
          >
            <Ionicons name='save-outline' size={24} color={theme.primary} />
          </HeaderButton>
        }
      />
      {/* Personal Information Section */}
      <Card>
        <CardContent>
          <View style={{ gap: theme.gap }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                marginBottom: 8,
              }}
            >
              <Ionicons name='person-outline' size={20} color={theme.primary} />
              <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>
                {t('personalInformation')}
              </ThemedText>
            </View>

            <Controller
              control={control}
              name='firstName'
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={t('firstName')}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder={t('firstNamePlaceholder')}
                  autoCapitalize='words'
                  autoComplete='name'
                  error={!!errors.firstName}
                  errorMessage={getErrorMessage(errors.firstName)}
                />
              )}
            />

            <Controller
              control={control}
              name='lastName'
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={t('lastName')}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder={t('lastNamePlaceholder')}
                  autoCapitalize='words'
                  autoComplete='name-family'
                  error={!!errors.lastName}
                  errorMessage={getErrorMessage(errors.lastName)}
                />
              )}
            />
          </View>
        </CardContent>
      </Card>

      {/* Contact Information Section */}
      <Card>
        <CardContent>
          <View style={{ gap: 20 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                marginBottom: 8,
              }}
            >
              <Ionicons name='mail-outline' size={20} color={theme.primary} />
              <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>
                {t('contactInformation')}
              </ThemedText>
            </View>

            <View>
              <Input
                value={user.email}
                label={t('email')}
                keyboardType='email-address'
                autoCapitalize='none'
                autoComplete='email'
                readOnly={true}
              />
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: 6,
                  backgroundColor: theme.muted + '30',
                  padding: 8,
                  borderRadius: theme.radius / 2,
                }}
              >
                <Ionicons
                  name='information-circle-outline'
                  size={16}
                  color={theme.mutedForeground}
                />
                <ThemedText
                  style={{
                    fontSize: 12,
                    color: theme.mutedForeground,
                    flex: 1,
                  }}
                >
                  {t('emailCannotBeChanged')}
                </ThemedText>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Controller
                control={control}
                name={'countryCode'}
                render={({ field: { onChange, value } }) => (
                  <View style={{ flex: 1 }}>
                    <Select
                      value={value}
                      onValueChange={onChange}
                      error={!!errors.countryCode}
                      errorMessage={errors.countryCode?.message}
                    >
                      <SelectTrigger
                        placeholder={t('country')}
                        labelText={t('countryCode')}
                      />
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
                  </View>
                )}
              />

              <Controller
                control={control}
                name='phoneNumber'
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label={t('phoneNumber')}
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    keyboardType='phone-pad'
                    placeholder='Enter phone number'
                    autoCapitalize='none'
                    autoComplete='tel'
                    rootStyle={{ flex: 2 }}
                    error={!!errors.phoneNumber}
                    errorMessage={getErrorMessage(errors.phoneNumber)}
                  />
                )}
              />
            </View>
          </View>
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card>
        <CardContent>
          <View style={{ gap: 12 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                marginBottom: 8,
              }}
            >
              <Ionicons
                name='lock-closed-outline'
                size={20}
                color={theme.primary}
              />
              <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>
                {t('security')}
              </ThemedText>
            </View>

            <Controller
              control={control}
              name='password'
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <Input
                    label={t('newPassword')}
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder={t('enterNewPasswordOptional')}
                    autoCapitalize='none'
                    secureTextEntry
                    autoComplete='password-new'
                    error={!!errors.password}
                    errorMessage={getErrorMessage(errors.password)}
                  />

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      marginTop: 6,
                      backgroundColor: theme.muted + '30',
                      padding: 8,
                      borderRadius: theme.radius / 2,
                    }}
                  >
                    <Ionicons
                      name='shield-checkmark-outline'
                      size={16}
                      color={theme.mutedForeground}
                    />

                    <ThemedText
                      style={{
                        fontSize: 12,
                        color: theme.mutedForeground,
                        flex: 1,
                      }}
                    >
                      {t('leaveBlankToKeepCurrentPassword')}
                    </ThemedText>
                  </View>
                </View>
              )}
            />
          </View>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <View style={{ gap: 12, marginTop: 8 }}>
        <Button
          disabled={updateProfile.isPending}
          onPress={handleSubmit(handleUpdateProfile)}
          isLoading={updateProfile.isPending}
        >
          {!updateProfile.isPending && <ButtonIcon name='save-outline' />}
          <ButtonText>
            {updateProfile.isPending ? t('updatingProfile') : t('saveChanges')}
          </ButtonText>
        </Button>

        <Divider />

        {/* Danger Zone */}
        <View
          style={{
            backgroundColor: theme.destructive + '15',
            padding: 12,
            borderRadius: theme.radius,
            borderWidth: 1,
            borderColor: theme.destructive + '30',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              marginBottom: 8,
            }}
          >
            <Ionicons
              name='warning-outline'
              size={20}
              color={theme.destructive}
            />
            <ThemedText
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: theme.destructive,
              }}
            >
              {t('dangerZone')}
            </ThemedText>
          </View>
          <ThemedText
            style={{
              fontSize: 12,
              color: theme.mutedForeground,
              marginBottom: 12,
            }}
          >
            {t('deletingAccountIsPermanent')}
          </ThemedText>
          <Link href={'/settings/delete-account'} style={styles.deleteButton}>
            <Ionicons
              name='trash-outline'
              size={18}
              color={theme.destructive}
            />
            {t('deleteAccount')}
          </Link>
        </View>
      </View>
    </FormViewContainer>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 10,
    width: '100%',
    maxWidth: 500,
    marginHorizontal: 'auto',
    gap: 16,
  },
  deleteButton: {
    color: theme.destructive,
    padding: 12,
    borderColor: theme.destructive,
    borderWidth: 1,
    borderRadius: theme.radius,
    height: 44,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 14,
    backgroundColor: theme.card,
  },
});
