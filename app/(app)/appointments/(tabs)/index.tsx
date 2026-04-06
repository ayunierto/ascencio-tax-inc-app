import { router } from 'expo-router';
import React from 'react';
import { FlatList, RefreshControl, View, StyleSheet } from 'react-native';
import { toast } from 'sonner-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppointmentCard } from '@/components/bookings/AppointmentCard';
import { AppointmentsBottomAction } from '@/components/bookings/AppointmentsBottomAction';
import { AppointmentListSkeleton } from '@/components/bookings/AppointmentCardSkeleton';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/Button';
import { theme } from '@/components/ui';
import { DrawerPageHeader } from '@/components/ui/DrawerPageHeader';
import { ThemedText } from '@/components/themed-text';
import { cancelAppointment } from '@/core/appointments/actions/cancel-appointment.action';
import { getUserAppointments } from '@/core/appointments/actions/get-user-appointments.action';
import { Appointment } from '@/core/appointments/interfaces/appointmentResponse';
import { EmptyContent } from '@/core/components';
import { ServerException } from '@/core/interfaces/server-exception.response';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

export default function AppointmentsUpcomingTabScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const {
    data: pendingAppointments,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery<Appointment[], AxiosError<ServerException>>({
    queryKey: ['appointments', 'pending'],
    queryFn: async () => {
      const data = await getUserAppointments('pending');
      return data;
    },
    retry: 1,
    staleTime: 0,
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      cancelAppointment(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success(t('appointmentCancelled'), {
        description: t('appointmentCancelledDescription'),
      });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || t('errorCancellingAppointment'),
        {
          description: t('error'),
        },
      );
    },
  });

  const handleCancelAppointment = async (
    appointmentId: string,
    reason?: string,
  ) => {
    await cancelMutation.mutateAsync({ id: appointmentId, reason });
  };

  const handleBookNew = () => {
    router.push('/(app)/appointments/(tabs)/services');
  };

  if (isError) {
    return (
      <View style={styles.container}>
        <DrawerPageHeader title={t('appointments')} />
        <EmptyContent
          title={t('error')}
          subtitle={
            error.response?.data.message || error.message || t('errorOccurred')
          }
          icon='alert-circle-outline'
          action={
            <Button onPress={refetch}>
              <ButtonIcon name='refresh-outline' />
              <ButtonText>{t('retry')}</ButtonText>
            </Button>
          }
        />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <DrawerPageHeader title={t('appointments')} />
        <AppointmentListSkeleton />
      </View>
    );
  }

  if (!pendingAppointments || pendingAppointments.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <DrawerPageHeader title={t('appointments')} />
        <EmptyContent
          title={t('noAppointments')}
          subtitle={t('noAppointmentsDescription')}
          icon='calendar-outline'
        />
        <AppointmentsBottomAction bottomInset={insets.bottom}>
          <Button onPress={handleBookNew}>
            <ButtonIcon name='add-circle-outline' />
            <ButtonText>{t('bookAppointment')}</ButtonText>
          </Button>
        </AppointmentsBottomAction>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <DrawerPageHeader title={t('appointments')} />

      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>
          {t('upcomingAppointments')}
        </ThemedText>
      </View>

      <FlatList
        data={pendingAppointments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AppointmentCard
            appointment={item}
            onCancel={handleCancelAppointment}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      />

      <AppointmentsBottomAction bottomInset={insets.bottom}>
        <Button onPress={handleBookNew}>
          <ButtonIcon name='add-circle-outline' />
          <ButtonText>{t('bookNew')}</ButtonText>
        </Button>
      </AppointmentsBottomAction>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: theme.background,
    paddingBottom: 100,
  },
});
