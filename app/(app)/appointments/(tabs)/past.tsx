import { router } from 'expo-router';
import React from 'react';
import { FlatList, RefreshControl, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { AppointmentCard } from '@/components/bookings/AppointmentCard';
import { AppointmentListSkeleton } from '@/components/bookings/AppointmentCardSkeleton';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/Button';
import { theme, CustomHeader, HeaderButton } from '@/components/ui';
import { getUserAppointments } from '@/core/appointments/actions/get-user-appointments.action';
import { Appointment } from '@/core/appointments/interfaces/appointmentResponse';
import { EmptyContent } from '@/core/components';
import { ServerException } from '@/core/interfaces/server-exception.response';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

export default function AppointmentsPastTabScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const {
    data: pastAppointments,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery<Appointment[], AxiosError<ServerException>>({
    queryKey: ['appointments', 'past'],
    queryFn: async () => {
      const data = await getUserAppointments('past');
      return data;
    },
    retry: 1,
    staleTime: 0,
  });

  const handleBookNew = () => {
    router.push('/(app)/appointments/(tabs)/services');
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
              <Ionicons name='menu' size={24} color='#ffffff' />
            </HeaderButton>
          }
        />
        <EmptyContent
          title={t('error')}
          subtitle={
            error.response?.data.message ||
            error.message ||
            t('errorLoadingAppointment')
          }
          icon='alert-circle-outline'
          onRetry={refetch}
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
              <Ionicons name='menu' size={24} color='#ffffff' />
            </HeaderButton>
          }
        />
        <AppointmentListSkeleton />
      </View>
    );
  }

  if (!pastAppointments || pastAppointments.length === 0) {
    return (
      <View style={styles.container}>
        <CustomHeader
          title={t('appointments')}
          left={
            <HeaderButton
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            >
              <Ionicons name='menu' size={24} color='#ffffff' />
            </HeaderButton>
          }
        />
        <View style={styles.emptyContainer}>
          <EmptyContent
            title={t('noPastAppointments')}
            subtitle={t('noPastAppointmentsDescription')}
            icon='time-outline'
          />
          <View
            style={[styles.buttonContainer, { marginBottom: insets.bottom + 8 }]}
          >
            <Button onPress={handleBookNew}>
              <ButtonIcon name='add-circle-outline' />
              <ButtonText>{t('bookAppointment')}</ButtonText>
            </Button>
          </View>
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
            <Ionicons name='menu' size={24} color='#ffffff' />
          </HeaderButton>
        }
      />
      <FlatList
        data={pastAppointments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AppointmentCard appointment={item} isPast />}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 16 },
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  buttonContainer: {
    marginTop: 24,
  },
});
