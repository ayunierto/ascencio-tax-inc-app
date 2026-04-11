import { zodResolver } from '@hookform/resolvers/zod';
import { BookingProgressStepper } from '@/components/booking/BookingProgressStepper';
import { BookingSuccessModal } from '@/components/booking/BookingSuccessModal';
import { Card, CardContent } from '@/components/ui';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/Button';
import { theme } from '@/components/ui/theme';
import { ThemedText } from '@/components/themed-text';
import {
  bookAppointment,
  postAppointmentAddToCalendarAction,
} from '@/core/appointments/actions';
import { Appointment } from '@/core/appointments/interfaces';
import { AppointmentRequest } from '@/core/appointments/interfaces/appointment-request.interface';
import {
  bookingSummaryOptionsSchema,
  BookingSummaryOptionsValues,
} from '@/core/appointments/schemas/booking-summary-options.schema';
import { EmptyContent } from '@/core/components';
import { getClientCalendarStatusAction } from '@/core/calendar/actions';
import { ServerException } from '@/core/interfaces/server-exception.response';
import { useBookingStore } from '@/core/services/store/useBookingStore';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Link, router } from 'expo-router';
import { DateTime } from 'luxon';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  ScrollView,
  TouchableOpacity,
  View,
  StyleSheet,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

export default function BookingSummaryScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const {
    service,
    staffMember,
    start: startTimeUTC,
    end: endTimeUTC,
    timeZone,
    comments,
    resetBooking,
  } = useBookingStore();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookedAppointment, setBookedAppointment] =
    useState<Appointment | null>(null);
  const [autoAddedToCalendar, setAutoAddedToCalendar] = useState(false);

  const summaryOptionsForm = useForm<BookingSummaryOptionsValues>({
    resolver: zodResolver(bookingSummaryOptionsSchema),
    defaultValues: {
      addToCalendar: false,
    },
  });

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
      toast.error(t('errorCreatingAppointment'), {
        description: t('genericTryAgainLater'),
      });
    },
  });

  const { data: clientCalendarStatus, isLoading: loadingCalendarStatus } =
    useQuery({
      queryKey: ['client-calendar-status'],
      queryFn: getClientCalendarStatusAction,
    });

  const autoAddToCalendarMutation = useMutation({
    mutationFn: (appointmentId: string) =>
      postAppointmentAddToCalendarAction(appointmentId),
  });

  if (!service || !staffMember || !startTimeUTC || !timeZone || !endTimeUTC) {
    return (
      <EmptyContent
        title={t('incompleteBookingInformation')}
        subtitle={t('completeBookingDetails')}
      />
    );
  }

  const handleConfirm = summaryOptionsForm.handleSubmit(
    async (values: BookingSummaryOptionsValues) => {
      await mutate(
        {
          serviceId: service.id,
          staffId: staffMember.id,
          startTimeUTC,
          endTimeUTC,
          timeZone,
          comments: comments || '',
        },
        {
          onSuccess: (appointment) => {
            setAutoAddedToCalendar(false);
            setBookedAppointment(appointment);
            setShowSuccessModal(true);

            if (values.addToCalendar && clientCalendarStatus?.connected) {
              autoAddToCalendarMutation.mutate(appointment.id, {
                onSuccess: () => {
                  setAutoAddedToCalendar(true);
                  toast.success(t('calendarAutoAddSuccess'));
                },
                onError: () => {
                  toast.error(t('error'), {
                    description: t('calendarAutoAddError'),
                  });
                },
              });
            }
          },
          onError(error) {
            toast.error(error.response?.data.message || error.message, {
              description: t('error'),
            });
          },
        },
      );
    },
  );

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
    router.push('/(app)/appointments/(tabs)');
  };

  const startDateTime = DateTime.fromISO(startTimeUTC, { zone: 'utc' }).setZone(
    timeZone,
  );
  const endDateTime = DateTime.fromISO(endTimeUTC, { zone: 'utc' }).setZone(
    timeZone,
  );

  const duration = endDateTime.diff(startDateTime, 'minutes').minutes;

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        <View style={styles.content}>
          <BookingProgressStepper currentStep={3} />

          <View style={styles.header}>
            <ThemedText style={styles.title}>
              {t('reviewYourAppointment')}
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              {t('reviewAppointmentSubtitle')}
            </ThemedText>
          </View>

          {/* Service Card */}
          <Card>
            <CardContent style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                  <View style={styles.cardLabelRow}>
                    <Ionicons
                      name='briefcase-outline'
                      size={20}
                      color={theme.primary}
                    />
                    <ThemedText style={styles.cardLabel}>
                      {t('serviceUpper')}
                    </ThemedText>
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
                      name='time-outline'
                      size={16}
                      color={theme.mutedForeground}
                    />
                    <ThemedText style={styles.detailText}>
                      {t('durationMinutes', { count: duration })}
                    </ThemedText>
                  </View>
                </View>
                <TouchableOpacity onPress={() => handleEdit('service')}>
                  <Ionicons
                    name='pencil-outline'
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
                      name='person-outline'
                      size={20}
                      color={theme.primary}
                    />
                    <ThemedText style={styles.cardLabel}>
                      {t('staffMemberUpper')}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.cardTitle}>
                    {staffMember.firstName} {staffMember.lastName}
                  </ThemedText>
                </View>
                <TouchableOpacity onPress={() => handleEdit('staff')}>
                  <Ionicons
                    name='pencil-outline'
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
                      name='calendar-outline'
                      size={20}
                      color={theme.primary}
                    />
                    <ThemedText style={styles.cardLabel}>
                      {t('dateAndTimeUpper')}
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
                    {t('timeZoneLabel')}: {timeZone}
                  </ThemedText>
                </View>
                <TouchableOpacity onPress={() => handleEdit('time')}>
                  <Ionicons
                    name='pencil-outline'
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
                        name='chatbox-outline'
                        size={20}
                        color={theme.primary}
                      />
                      <ThemedText style={styles.cardLabel}>
                        {t('commentsUpper')}
                      </ThemedText>
                    </View>
                    <ThemedText style={styles.cardDescription}>
                      {comments}
                    </ThemedText>
                  </View>
                  <TouchableOpacity onPress={() => handleEdit('details')}>
                    <Ionicons
                      name='pencil-outline'
                      size={20}
                      color={theme.primary}
                    />
                  </TouchableOpacity>
                </View>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent style={styles.cardContent}>
              <View style={styles.autoAddCalendarRow}>
                <View style={styles.autoAddCalendarInfo}>
                  <View style={styles.cardLabelRow}>
                    <Ionicons
                      name='calendar-outline'
                      size={20}
                      color={theme.primary}
                    />
                    <ThemedText style={styles.cardLabel}>
                      {t('calendarIntegration')}
                    </ThemedText>
                  </View>

                  <ThemedText style={styles.autoAddCalendarTitle}>
                    {t('autoAddToCalendarLabel')}
                  </ThemedText>

                  <Link href={'/settings'}>
                    <ThemedText style={styles.autoAddCalendarHint}>
                      {loadingCalendarStatus
                        ? t('checkingAvailability')
                        : clientCalendarStatus?.connected
                          ? t('autoAddToCalendarDescription')
                          : t('autoAddToCalendarUnavailable')}
                    </ThemedText>
                  </Link>
                </View>

                <Controller
                  control={summaryOptionsForm.control}
                  name='addToCalendar'
                  render={({ field: { onChange, value } }) => (
                    <Switch
                      value={value}
                      onValueChange={onChange}
                      disabled={
                        loadingCalendarStatus ||
                        !clientCalendarStatus?.connected
                      }
                      trackColor={{ false: theme.muted, true: theme.primary }}
                    />
                  )}
                />
              </View>
            </CardContent>
          </Card>

          <View style={styles.actions}>
            <Button
              onPress={handleBack}
              variant='outline'
              style={styles.button}
              disabled={isPending}
            >
              <ButtonIcon name='arrow-back-outline' />
              <ButtonText>{t('back')}</ButtonText>
            </Button>
            <Button
              onPress={handleConfirm}
              style={styles.button}
              disabled={isPending}
            >
              {isPending ? (
                <ButtonText>{t('booking')}</ButtonText>
              ) : (
                <>
                  <ButtonIcon name='checkmark-circle-outline' />
                  <ButtonText>{t('confirm')}</ButtonText>
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
          autoAddedToCalendar={autoAddedToCalendar}
          autoAddingToCalendar={autoAddToCalendarMutation.isPending}
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
  autoAddCalendarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  autoAddCalendarInfo: {
    flex: 1,
    gap: 6,
  },
  autoAddCalendarTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  autoAddCalendarHint: {
    fontSize: 13,
    color: theme.primary,
    lineHeight: 18,
    textDecorationLine: 'underline',
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
