import { router } from 'expo-router';
import React from 'react';
import { FlatList, RefreshControl, View, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { AppointmentCard } from '@/components/bookings/AppointmentCard';
import { AppointmentListSkeleton } from '@/components/bookings/AppointmentCardSkeleton';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/Button';
import { theme, CustomHeader, HeaderButton } from '@/components/ui';
import { ThemedText } from '@/components/themed-text';
import { cancelAppointment } from '@/core/appointments/actions/cancel-appointment.action';
import { getUserAppointments } from '@/core/appointments/actions/get-user-appointments.action';
import { Appointment } from '@/core/appointments/interfaces/appointmentResponse';
import { EmptyContent } from '@/core/components';
import { ServerException } from '@/core/interfaces/server-exception.response';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

export default function AppointmentsIndexScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
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
      Toast.show({
        type: 'success',
        text1: t('appointmentCancelled'),
        text2: t('appointmentCancelledDescription'),
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: t('error'),
        text2: error.response?.data?.message || t('errorCancellingAppointment'),
      });
    },
  });

  const handleCancelAppointment = async (
    appointmentId: string,
    reason?: string,
  ) => {
    await cancelMutation.mutateAsync({ id: appointmentId, reason });
  };

  const handleBookNew = () => {
    router.push('/(app)/services');
  };

  const handleViewPast = () => {
    router.push('/(app)/appointments/past');
  };

  if (isError) {
    return (
      <View style={styles.container}>
        <CustomHeader
          title={t('appointments')}
          left={
            <HeaderButton
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            >
              <Ionicons name="menu" size={24} color="#ffffff" />
            </HeaderButton>
          }
        />
        <EmptyContent
          title="Error"
          subtitle={
            error.response?.data.message || error.message || 'An error occurred'
          }
          icon="alert-circle-outline"
          action={
            <Button onPress={refetch}>
              <ButtonIcon name="refresh-outline" />
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
        <CustomHeader
          title={t('appointments')}
          left={
            <HeaderButton
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            >
              <Ionicons name="menu" size={24} color="#ffffff" />
            </HeaderButton>
          }
        />
        <AppointmentListSkeleton />
      </View>
    );
  }

  if (!pendingAppointments || pendingAppointments.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <CustomHeader
          title={t('appointments')}
          left={
            <HeaderButton
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            >
              <Ionicons name="menu" size={24} color="#ffffff" />
            </HeaderButton>
          }
        />
        <EmptyContent
          title={t('noAppointments')}
          subtitle={t('noAppointmentsDescription')}
          icon="calendar-outline"
        />
        <View style={styles.buttonContainer}>
          <Button onPress={handleBookNew} style={styles.buttonSpacing}>
            <ButtonIcon name="add-circle-outline" />
            <ButtonText>{t('bookAppointment')}</ButtonText>
          </Button>
          <Button onPress={handleViewPast} variant="outline">
            <ButtonIcon name="time-outline" />
            <ButtonText>{t('viewHistory')}</ButtonText>
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomHeader
        title={t('appointments')}
        left={
          <HeaderButton
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          >
            <Ionicons name="menu" size={24} color="#ffffff" />
          </HeaderButton>
        }
      />
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>
          {t('upcomingAppointments')}
        </ThemedText>
        <Button onPress={handleViewPast} variant="ghost" size="sm">
          <ButtonText size="sm">{t('viewHistory')}</ButtonText>
          <ButtonIcon name="arrow-forward" />
        </Button>
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
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      />

      <View style={styles.fab}>
        <Button onPress={handleBookNew}>
          <ButtonIcon name="add-circle-outline" />
          <ButtonText>Book New</ButtonText>
        </Button>
      </View>
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
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: theme.background,
  },
  buttonContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  buttonSpacing: {
    marginBottom: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    left: 16,
  },
});
