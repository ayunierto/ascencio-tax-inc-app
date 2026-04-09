import { Ionicons } from '@expo/vector-icons';
import { DateTime } from 'luxon';
import React, { useEffect, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Linking,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { toast } from 'sonner-native';

import { getAppointmentAddToCalendarDataAction } from '@/core/appointments/actions';
import { getClientCalendarStatusAction } from '@/core/calendar/actions';
import { startClientCalendarOAuth } from '@/core/calendar/utils/client-calendar-oauth';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/Button';
import { theme } from '@/components/ui/theme';
import { ThemedText } from '@/components/ui/ThemedText';
import { Appointment } from '@/core/appointments/interfaces/appointmentResponse';

interface BookingSuccessModalProps {
  visible: boolean;
  appointment: Appointment;
  onClose: () => void;
  onViewAppointments: () => void;
}

export const BookingSuccessModal = ({
  visible,
  appointment,
  onClose,
  onViewAppointments,
}: BookingSuccessModalProps) => {
  const { t } = useTranslation();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const confettiAnims = useRef(
    Array.from({ length: 15 }, () => ({
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      opacity: new Animated.Value(1),
      rotate: new Animated.Value(0),
    })),
  ).current;

  useEffect(() => {
    if (visible) {
      // Animate modal entrance
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();

      // Animate confetti
      confettiAnims.forEach((anim, index) => {
        Animated.parallel([
          Animated.timing(anim.translateY, {
            toValue: 600,
            duration: 2000 + index * 100,
            useNativeDriver: true,
          }),
          Animated.timing(anim.translateX, {
            toValue: (Math.random() - 0.5) * 400,
            duration: 2000 + index * 100,
            useNativeDriver: true,
          }),
          Animated.timing(anim.opacity, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(anim.rotate, {
            toValue: Math.random() * 720,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
      scaleAnim.setValue(0);
      confettiAnims.forEach((anim) => {
        anim.translateY.setValue(0);
        anim.translateX.setValue(0);
        anim.opacity.setValue(1);
        anim.rotate.setValue(0);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // TODO: Implement add-to-calendar functionality (expo-calendar).

  const {
    data: clientCalendarStatus,
    isFetching: loadingClientCalendarStatus,
    refetch: refetchClientCalendarStatus,
  } = useQuery({
    queryKey: ['client-calendar-status'],
    queryFn: getClientCalendarStatusAction,
    enabled: visible,
  });

  const connectCalendarMutation = useMutation({
    mutationFn: async () =>
      startClientCalendarOAuth('/appointments/new/summary'),
    onSuccess: async (result) => {
      if (result.status === 'success') {
        toast.success(t('googleCalendarConnectedNow'));
      } else if (result.status === 'error') {
        toast.error(t('error'), {
          description: result.error ?? t('genericTryAgainLater'),
        });
      }

      await refetchClientCalendarStatus();
    },
    onError: () => {
      toast.error(t('error'), {
        description: t('genericTryAgainLater'),
      });
    },
  });

  const addToCalendarMutation = useMutation({
    mutationFn: async () =>
      getAppointmentAddToCalendarDataAction(appointment.id),
    onSuccess: async (result) => {
      await Linking.openURL(result.googleCalendarUrl);
      toast.success(t('calendarOpenGoogleSuccess'));
    },
    onError: () => {
      toast.error(t('error'), {
        description: t('genericTryAgainLater'),
      });
    },
  });

  const startDate = DateTime.fromISO(appointment.start);
  const now = DateTime.now();
  const diff = startDate.diff(now, ['days', 'hours', 'minutes']);

  const getCountdown = () => {
    if (diff.days >= 1) {
      return `${Math.floor(diff.days)} ${Math.floor(diff.days) === 1 ? 'day' : 'days'}`;
    } else if (diff.hours >= 1) {
      return `${Math.floor(diff.hours)} ${Math.floor(diff.hours) === 1 ? 'hour' : 'hours'}`;
    } else {
      return `${Math.floor(diff.minutes)} minutes`;
    }
  };

  return (
    <Modal visible={visible} transparent animationType='fade'>
      <View style={styles.overlay}>
        {/* Confetti */}
        {confettiAnims.map((anim, index) => (
          <Animated.View
            key={index}
            style={[
              styles.confetti,
              {
                left: 50 + (index % 5) * 60,
                backgroundColor: [
                  theme.primary,
                  theme.success,
                  '#FFD700',
                  '#FF6B9D',
                  '#9B59B6',
                ][index % 5],
                transform: [
                  { translateY: anim.translateY },
                  { translateX: anim.translateX },
                  {
                    rotate: anim.rotate.interpolate({
                      inputRange: [0, 360],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
                opacity: anim.opacity,
              },
            ]}
          />
        ))}

        {/* Modal Content */}
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Success Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.successCircle}>
              <Ionicons
                name='checkmark-circle'
                size={80}
                color={theme.success}
              />
            </View>
          </View>

          {/* Title */}
          <ThemedText style={styles.title}>
            {t('appointmentConfirmed')}
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {t('appointmentConfirmedDescription')}
          </ThemedText>

          {/* Appointment Details Card */}
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Ionicons name='calendar' size={20} color={theme.primary} />
              <ThemedText style={styles.detailText}>
                {startDate.toLocaleString(DateTime.DATE_HUGE)}
              </ThemedText>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name='time' size={20} color={theme.primary} />
              <ThemedText style={styles.detailText}>
                {startDate.toFormat('h:mm a')} -{' '}
                {DateTime.fromISO(appointment.end).toFormat('h:mm a')}
              </ThemedText>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name='person' size={20} color={theme.primary} />
              <ThemedText style={styles.detailText}>
                {appointment.staffMember.firstName}{' '}
                {appointment.staffMember.lastName}
              </ThemedText>
            </View>

            {appointment.service.isAvailableOnline &&
              appointment.zoomMeetingLink && (
                <View style={styles.detailRow}>
                  <Ionicons name='videocam' size={20} color={theme.primary} />
                  <ThemedText style={styles.detailText}>
                    {t('onlineMeeting')}
                  </ThemedText>
                </View>
              )}
          </View>

          {/* Countdown */}
          <View style={styles.countdownContainer}>
            <ThemedText style={styles.countdownLabel}>
              {t('appointmentStartsIn')}
            </ThemedText>
            <ThemedText style={styles.countdownValue}>
              {getCountdown()}
            </ThemedText>
          </View>

          {/* Calendar Integration */}
          <View style={styles.calendarCard}>
            <View style={styles.calendarHeaderRow}>
              <Ionicons name='logo-google' size={18} color={theme.primary} />
              <ThemedText style={styles.calendarTitle}>
                {t('calendarIntegration')}
              </ThemedText>
              <Ionicons
                name={
                  clientCalendarStatus?.connected
                    ? 'checkmark-circle'
                    : 'close-circle'
                }
                size={18}
                color={
                  clientCalendarStatus?.connected
                    ? theme.success
                    : theme.mutedForeground
                }
              />
            </View>

            <ThemedText style={styles.calendarHint}>
              {loadingClientCalendarStatus
                ? t('checkingAvailability')
                : clientCalendarStatus?.connected
                  ? t('calendarConnectedAddEventHint')
                  : t('calendarNotConnectedAddEventHint')}
            </ThemedText>

            {clientCalendarStatus?.connected ? (
              <Button
                variant='outline'
                onPress={() => addToCalendarMutation.mutate()}
                isLoading={addToCalendarMutation.isPending}
                style={styles.button}
              >
                <ButtonIcon name='calendar-outline' />
                <ButtonText>
                  {addToCalendarMutation.isPending
                    ? t('addingToCalendar')
                    : t('addToGoogleCalendar')}
                </ButtonText>
              </Button>
            ) : (
              <Button
                variant='outline'
                onPress={() => connectCalendarMutation.mutate()}
                isLoading={connectCalendarMutation.isPending}
                style={styles.button}
              >
                <ButtonIcon name='link-outline' />
                <ButtonText>
                  {connectCalendarMutation.isPending
                    ? t('connectingGoogleCalendar')
                    : t('connectGoogleCalendar')}
                </ButtonText>
              </Button>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            <Button onPress={onViewAppointments} style={styles.button}>
              <ButtonIcon name='list-outline' />
              <ButtonText>{t('myAppointments')}</ButtonText>
            </Button>
          </View>

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <ThemedText style={styles.closeText}>{t('done')}</ThemedText>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confetti: {
    position: 'absolute',
    top: -20,
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  modalContent: {
    backgroundColor: theme.background,
    borderRadius: theme.radius * 3,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  iconContainer: {
    marginBottom: 20,
  },
  successCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: theme.mutedForeground,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  detailsCard: {
    width: '100%',
    backgroundColor: theme.card,
    borderRadius: theme.radius,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    fontSize: 15,
    flex: 1,
  },
  countdownContainer: {
    width: '100%',
    backgroundColor: theme.primary + '15',
    borderRadius: theme.radius,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  countdownLabel: {
    fontSize: 13,
    color: theme.mutedForeground,
    marginBottom: 4,
  },
  countdownValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.primary,
  },
  calendarCard: {
    width: '100%',
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 14,
    gap: 10,
    marginBottom: 20,
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calendarTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  calendarHint: {
    fontSize: 13,
    color: theme.mutedForeground,
  },
  buttonsContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    width: '100%',
  },
  closeButton: {
    padding: 12,
  },
  closeText: {
    fontSize: 16,
    color: theme.mutedForeground,
    fontWeight: '500',
  },
});
