import { BookingProgressStepper } from '@/components/booking/BookingProgressStepper';
import { BookingSuccessModal } from '@/components/booking/BookingSuccessModal';
import { Card, CardContent } from '@/components/ui';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/Button';
import { theme } from '@/components/ui/theme';
import { ThemedText } from '@/components/themed-text';
import { bookAppointment } from '@/core/appointments/actions';
import { Appointment } from '@/core/appointments/interfaces';
import { AppointmentRequest } from '@/core/appointments/interfaces/appointment-request.interface';
import { EmptyContent } from '@/core/components';
import { ServerException } from '@/core/interfaces/server-exception.response';
import { useBookingStore } from '@/core/services/store/useBookingStore';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { router } from 'expo-router';
import { DateTime } from 'luxon';
import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';

export default function BookingSummaryScreen() {
  const { service, staffMember, start, end, timeZone, comments, resetBooking } =
    useBookingStore();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookedAppointment, setBookedAppointment] =
    useState<Appointment | null>(null);

  const queryClient = useQueryClient();
  const { mutateAsync: mutate, isPending } = useMutation<
    Appointment,
    AxiosError<ServerException>,
    AppointmentRequest
  >({
    mutationFn: bookAppointment,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: async () => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Something went wrong. Please try again later.',
      });
    },
  });

  if (!service || !staffMember || !start || !timeZone || !end) {
    return (
      <EmptyContent
        title="Incomplete booking information"
        subtitle="Please go back and complete your booking details."
      />
    );
  }

  const handleConfirm = async () => {
    await mutate(
      {
        serviceId: service.id,
        staffId: staffMember.id,
        start,
        end,
        timeZone,
        comments: comments || '',
      },
      {
        onSuccess(appointment) {
          setBookedAppointment(appointment);
          setShowSuccessModal(true);
        },
        onError(error) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: error.response?.data.message || error.message,
          });
        },
      },
    );
  };

  const handleEdit = (section: string) => {
    if (section === 'service' || section === 'staff' || section === 'time') {
      router.push('/(app)/appointments/new/availability');
    } else if (section === 'details') {
      router.push('/(app)/appointments/new/details');
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    resetBooking();
    router.push('/(app)/appointments');
  };

  const startDateTime = DateTime.fromISO(start, { zone: 'utc' }).setZone(
    timeZone,
  );
  const endDateTime = DateTime.fromISO(end, { zone: 'utc' }).setZone(timeZone);

  const duration = endDateTime.diff(startDateTime, 'minutes').minutes;

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <BookingProgressStepper currentStep={3} />

          <View style={styles.header}>
            <ThemedText style={styles.title}>
              Review Your Appointment
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Please review all details before confirming your appointment
            </ThemedText>
          </View>

          {/* Service Card */}
          <Card>
            <CardContent style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                  <View style={styles.cardLabelRow}>
                    <Ionicons
                      name="briefcase-outline"
                      size={20}
                      color={theme.primary}
                    />
                    <ThemedText style={styles.cardLabel}>SERVICE</ThemedText>
                  </View>
                  <ThemedText style={styles.cardTitle}>
                    {service.name}
                  </ThemedText>
                  {service.description && (
                    <ThemedText style={styles.cardDescription}>
                      {service.description}
                    </ThemedText>
                  )}
                  <View style={styles.detailRow}>
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color={theme.mutedForeground}
                    />
                    <ThemedText style={styles.detailText}>
                      {duration} minutes
                    </ThemedText>
                  </View>
                </View>
                <TouchableOpacity onPress={() => handleEdit('service')}>
                  <Ionicons
                    name="pencil-outline"
                    size={20}
                    color={theme.primary}
                  />
                </TouchableOpacity>
              </View>
            </CardContent>
          </Card>

          {/* Staff Card */}
          <Card>
            <CardContent style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                  <View style={styles.cardLabelRow}>
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color={theme.primary}
                    />
                    <ThemedText style={styles.cardLabel}>
                      STAFF MEMBER
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.cardTitle}>
                    {staffMember.firstName} {staffMember.lastName}
                  </ThemedText>
                </View>
                <TouchableOpacity onPress={() => handleEdit('staff')}>
                  <Ionicons
                    name="pencil-outline"
                    size={20}
                    color={theme.primary}
                  />
                </TouchableOpacity>
              </View>
            </CardContent>
          </Card>

          {/* Date & Time Card */}
          <Card>
            <CardContent style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                  <View style={styles.cardLabelRow}>
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color={theme.primary}
                    />
                    <ThemedText style={styles.cardLabel}>
                      DATE & TIME
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.cardTitle}>
                    {startDateTime.toFormat('MMMM dd, yyyy')}
                  </ThemedText>
                  <ThemedText style={styles.cardDescription}>
                    {startDateTime.toFormat('h:mm a')} -{' '}
                    {endDateTime.toFormat('h:mm a')}
                  </ThemedText>
                  <ThemedText style={styles.detailText}>
                    Time zone: {timeZone}
                  </ThemedText>
                </View>
                <TouchableOpacity onPress={() => handleEdit('time')}>
                  <Ionicons
                    name="pencil-outline"
                    size={20}
                    color={theme.primary}
                  />
                </TouchableOpacity>
              </View>
            </CardContent>
          </Card>

          {/* Comments Card */}
          {comments && (
            <Card>
              <CardContent style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardInfo}>
                    <View style={styles.cardLabelRow}>
                      <Ionicons
                        name="chatbox-outline"
                        size={20}
                        color={theme.primary}
                      />
                      <ThemedText style={styles.cardLabel}>COMMENTS</ThemedText>
                    </View>
                    <ThemedText style={styles.cardDescription}>
                      {comments}
                    </ThemedText>
                  </View>
                  <TouchableOpacity onPress={() => handleEdit('details')}>
                    <Ionicons
                      name="pencil-outline"
                      size={20}
                      color={theme.primary}
                    />
                  </TouchableOpacity>
                </View>
              </CardContent>
            </Card>
          )}

          <View style={styles.actions}>
            <Button
              onPress={handleBack}
              variant="outline"
              style={styles.button}
              disabled={isPending}
            >
              <ButtonIcon name="arrow-back-outline" />
              <ButtonText>Back</ButtonText>
            </Button>
            <Button
              onPress={handleConfirm}
              style={styles.button}
              disabled={isPending}
            >
              {isPending ? (
                <ButtonText>Booking...</ButtonText>
              ) : (
                <>
                  <ButtonIcon name="checkmark-circle-outline" />
                  <ButtonText>Confirm</ButtonText>
                </>
              )}
            </Button>
          </View>
        </View>
      </ScrollView>

      {bookedAppointment && (
        <BookingSuccessModal
          visible={showSuccessModal}
          onClose={handleModalClose}
          onViewAppointments={handleModalClose}
          appointment={bookedAppointment}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    padding: 16,
    gap: 20,
    paddingBottom: 40,
  },
  header: {
    gap: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: theme.mutedForeground,
    lineHeight: 20,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardInfo: {
    flex: 1,
    gap: 8,
  },
  cardLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardLabel: {
    fontSize: 12,
    color: theme.mutedForeground,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 13,
    color: theme.mutedForeground,
    lineHeight: 18,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  detailText: {
    fontSize: 13,
    color: theme.mutedForeground,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
  },
});
