import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useAuthStore } from '@/core/auth/store/useAuthStore';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card/Card';
import { Input } from '@/components/ui/Input';
import { theme } from '@/components/ui/theme';
import { ThemedText } from '@/components/ui/ThemedText';
import { useDeleteAccountMutation } from '@/core/auth/hooks';
import ErrorMessage from '@/core/components/ErrorMessage';
import { DeleteAccountRequest, deleteAccountSchema } from '@ascencio/shared';
import { toast } from 'sonner-native';

const DeleteAccountModal = () => {
  const { user } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<DeleteAccountRequest>({
    resolver: zodResolver(deleteAccountSchema),
  });

  const { mutate: deleteAccount, isPending } = useDeleteAccountMutation();

  const handleAccountDeletion = async ({ password }: DeleteAccountRequest) => {
    deleteAccount(
      { password },
      {
        onSuccess: () => {
          toast.success('Your account has been successfully deleted.');
          router.replace('/(auth)/login');
        },
        onError: (error) => {
          toast.error(
            error.message ||
              'An error occurred while deleting the account. Please try again later.',
          );
        },
      },
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="warning" size={48} color={theme.destructive} />
        </View>
        <ThemedText style={styles.title}>Delete Account</ThemedText>
        <ThemedText style={styles.subtitle}>
          This action cannot be undone
        </ThemedText>
      </View>

      <Card>
        <CardContent style={styles.cardContent}>
          <View style={styles.warningBanner}>
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color={theme.destructive}
            />
            <ThemedText style={styles.warningText}>
              Deleting your account will permanently erase all your data and
              access to associated services.
            </ThemedText>
          </View>

          <View style={styles.infoSection}>
            <ThemedText style={styles.infoLabel}>Current Email</ThemedText>
            <ThemedText style={styles.infoValue}>{user?.email}</ThemedText>
          </View>

          {errors.root && <ErrorMessage message={errors.root.message} />}

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Confirm Password"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                secureTextEntry
                placeholder="Enter your password"
                autoCapitalize="none"
                autoComplete="off"
                error={!!errors.password}
                errorMessage={errors.password?.message}
                helperText="Enter your password to confirm deletion"
              />
            )}
          />

          <Button
            disabled={isPending}
            onPress={handleSubmit(handleAccountDeletion)}
            variant="destructive"
          >
            <ButtonIcon name="trash-outline" />
            <ButtonText>
              {isPending ? 'Deleting Account...' : 'Delete My Account'}
            </ButtonText>
          </Button>
        </CardContent>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  contentContainer: {
    padding: 10,
    gap: 16,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.destructive + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.destructive,
  },
  subtitle: {
    fontSize: 14,
    color: theme.mutedForeground,
  },
  cardContent: {
    gap: 20,
  },
  warningBanner: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    backgroundColor: theme.destructive + '10',
    borderRadius: theme.radius,
    borderLeftWidth: 4,
    borderLeftColor: theme.destructive,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: theme.foreground,
    lineHeight: 20,
  },
  infoSection: {
    padding: 14,
    backgroundColor: theme.muted + '10',
    borderRadius: theme.radius,
    gap: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: theme.mutedForeground,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: theme.foreground,
    fontWeight: '600',
  },
});

export default DeleteAccountModal;
