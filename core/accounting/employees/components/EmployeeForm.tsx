import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

import {
  Employee,
  CreateEmployeeRequest,
  createEmployeeSchema,
} from '@ascencio/shared';
import { Input } from '@/components/ui/Input';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { theme } from '@/components/ui';
import { ThemedText } from '@/components/ui/ThemedText';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/Select';
import {
  useCreateEmployeeMutation,
  useDeleteEmployeeMutation,
  useUpdateEmployeeMutation,
} from '../hooks';
import { useCompanies } from '../../companies/hooks';

interface EmployeeFormProps {
  employee: Employee;
}

export const EmployeeForm = ({ employee }: EmployeeFormProps) => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: companiesData } = useCompanies();
  const companies = companiesData?.items ?? [];

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      id: employee.id,
      companyId: employee.companyId,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email || '',
      phone: employee.phone || '',
      address: employee.address || '',
      city: employee.city || '',
      province: employee.province || '',
      postalCode: employee.postalCode || '',
      position: employee.position || '',
      hourlyRate: employee.hourlyRate,
      salary: employee.salary,
      sin: employee.sin || '',
      startDate: employee.startDate,
      endDate: employee.endDate,
      isActive: employee.isActive ?? true,
      notes: employee.notes || '',
    },
  });

  const createEmployee = useCreateEmployeeMutation();
  const updateEmployee = useUpdateEmployeeMutation();
  const deleteEmployee = useDeleteEmployeeMutation();

  const isNew = employee.id === 'new';

  const onSubmit = async (values: any) => {
    console.log('Form Values:', values);
    const submitData: CreateEmployeeRequest = {
      ...values,
      // Convert empty strings to undefined for optional fields
      email: values.email || undefined,
      phone: values.phone || undefined,
    };

    if (!isNew) {
      await updateEmployee.mutateAsync(
        { ...submitData, id: employee.id },
        {
          onSuccess: () => {
            toast.success(t('employeeUpdatedSuccessfully'));
            setTimeout(() => router.back(), 500);
          },
          onError: (error) => {
            toast.error(
              t(error.response?.data.message || 'unknownErrorOccurred'),
            );
          },
        },
      );
      return;
    }

    await createEmployee.mutateAsync(submitData, {
      onSuccess: () => {
        toast.success(t('employeeCreatedSuccessfully'));
        setTimeout(() => router.back(), 500);
      },
      onError: (error) => {
        toast.error(t(error.response?.data.message || 'unknownErrorOccurred'));
      },
    });
  };

  const handleDeleteEmployee = async () => {
    setIsDeleting(true);
    try {
      await deleteEmployee.mutateAsync(employee.id, {
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
      console.error('Error deleting employee:', error);
      toast.error(t('unknownErrorOccurred'));
      setIsDeleting(false);
    }
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: isNew ? t('newEmployee') : t('employeeDetails'),
      headerRight: () => (
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={
              createEmployee.isPending || updateEmployee.isPending || isDeleting
            }
          >
            {createEmployee.isPending || updateEmployee.isPending ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <Ionicons name="save-outline" size={24} color={theme.primary} />
            )}
          </TouchableOpacity>

          {!isNew && (
            <TouchableOpacity
              onPress={handleDeleteEmployee}
              disabled={
                createEmployee.isPending ||
                updateEmployee.isPending ||
                isDeleting
              }
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color={theme.destructive} />
              ) : (
                <Ionicons
                  name="trash-outline"
                  size={24}
                  color={theme.destructive}
                />
              )}
            </TouchableOpacity>
          )}
        </View>
      ),
    });
  }, [
    isNew,
    t,
    handleSubmit,
    createEmployee.isPending,
    updateEmployee.isPending,
    isDeleting,
  ]);

  return (
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
          {/* Company Selection */}
          <View>
            <Controller
              control={control}
              name="companyId"
              render={({ field: { onChange, value } }) => (
                <Select
                  value={value || ''}
                  onValueChange={(val) => onChange(val || undefined)}
                  options={[
                    { label: t('noCompany'), value: '' },
                    ...companies.map((company) => ({
                      label: company.name,
                      value: company.id,
                    })),
                  ]}
                >
                  <SelectTrigger
                    placeholder={t('selectCompany')}
                    labelText={`${t('company')} (${t('optional')})`}
                  />
                  <SelectContent>
                    <SelectItem label={t('noCompany')} value="" />
                    {companies.map((company) => (
                      <SelectItem
                        key={company.id}
                        label={company.name}
                        value={company.id}
                      />
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 16 }}>
            <Controller
              control={control}
              name="firstName"
              render={({ field: { onChange, value } }) => (
                <Input
                  onChangeText={onChange}
                  value={value}
                  label={t('firstName')}
                  error={!!errors.firstName}
                  errorMessage={getErrorMessage(errors.firstName)}
                  style={{ flex: 1 }}
                />
              )}
            />

            <Controller
              control={control}
              name="lastName"
              render={({ field: { onChange, value } }) => (
                <Input
                  onChangeText={onChange}
                  value={value}
                  label={t('lastName')}
                  error={!!errors.lastName}
                  errorMessage={getErrorMessage(errors.lastName)}
                  style={{ flex: 1 }}
                />
              )}
            />
          </View>

          <Controller
            control={control}
            name="position"
            render={({ field: { onChange, value } }) => (
              <Input
                label={t('position')}
                onChangeText={onChange}
                value={value}
                error={!!errors.position}
                errorMessage={getErrorMessage(errors.position)}
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
            name="sin"
            render={({ field: { onChange, value } }) => (
              <Input
                label={t('sin')}
                onChangeText={onChange}
                value={value}
                error={!!errors.sin}
                errorMessage={getErrorMessage(errors.sin)}
                helperText={` ${t('format')}: 123-456-789`}
                secureTextEntry
              />
            )}
          />

          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, value } }) => (
              <Input
                label={t('notes')}
                onChangeText={onChange}
                value={value}
                multiline
                numberOfLines={3}
                error={!!errors.notes}
                errorMessage={getErrorMessage(errors.notes)}
              />
            )}
          />

          {/* Active Status */}
          <Controller
            control={control}
            name="isActive"
            render={({ field: { onChange, value } }) => (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  backgroundColor: theme.card,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              >
                <ThemedText style={{ fontWeight: '500' }}>
                  {t('activeEmployee')}
                </ThemedText>
                <Switch
                  value={value}
                  onValueChange={onChange}
                  trackColor={{ false: theme.muted, true: theme.primary }}
                />
              </View>
            )}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
