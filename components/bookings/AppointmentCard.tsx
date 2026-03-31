import { Ionicons } from '@expo/vector-icons';
import { DateTime } from 'luxon';
import React, { useState } from 'react';
import { Linking, TouchableOpacity, View } from 'react-native';

import { CancelAppointmentModal } from '@/components/bookings/CancelAppointmentModal';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { theme } from '@/components/ui/theme';
import { ThemedText } from '@/components/ui/ThemedText';
import { Appointment } from '@/core/appointments/interfaces/appointmentResponse';

interface AppointmentCardProps {
  appointment: Appointment;
  isPast?: boolean;
  onCancel?: (appointmentId: string, reason?: string) => Promise<void>;
}

export const AppointmentCard = ({
  appointment,
  isPast = false,
  onCancel,
}: AppointmentCardProps) => {
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Get relative time
  const getRelativeTime = () => {
    const now = DateTime.now();
    const start = DateTime.fromISO(appointment.start);
    const diff = start.diff(now, ['days', 'hours', 'minutes']);

    if (isPast) return 'Completed';

    if (diff.days >= 1) {
      return `In ${Math.floor(diff.days)} ${Math.floor(diff.days) === 1 ? 'day' : 'days'}`;
    } else if (diff.hours >= 1) {
      return `In ${Math.floor(diff.hours)} ${Math.floor(diff.hours) === 1 ? 'hour' : 'hours'}`;
    } else if (diff.minutes > 0) {
      return `In ${Math.floor(diff.minutes)} minutes`;
    } else {
      return 'Now';
    }
  };

  // Get status badge color
  const getStatusColor = () => {
    if (isPast) return theme.mutedForeground;

    const status = appointment.status?.toLowerCase();
    switch (status) {
      case 'confirmed':
        return theme.success;
      case 'pending':
        return '#f59e0b'; // Orange color for pending
      case 'cancelled':
        return theme.destructive;
      default:
        return theme.primary;
    }
  };

  const handleJoinMeeting = () => {
    if (appointment.zoomMeetingLink) {
      Linking.openURL(appointment.zoomMeetingLink);
    }
  };

  const handleCancelPress = () => {
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async (reason: string) => {
    if (onCancel) {
      setIsCancelling(true);
      try {
        await onCancel(appointment.id, reason);
        setShowCancelModal(false);
      } catch (error) {
        console.error('Error cancelling appointment:', error);
      } finally {
        setIsCancelling(false);
      }
    }
  };

  const startDate = DateTime.fromISO(appointment.start);
  const endDate = DateTime.fromISO(appointment.end);
  const duration = endDate.diff(startDate, 'minutes').minutes;

  // Check if meeting is today and within time range
  const isToday = startDate.hasSame(DateTime.now(), 'day');
  const isUpcoming = startDate > DateTime.now();
  const canJoin = isToday && !isPast;

  return (
    <TouchableOpacity activeOpacity={0.7} style={{ marginBottom: 16 }}>
      <Card>
        <CardContent>
          {/* Header with Status Badge */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 12,
            }}
          >
            <View style={{ flex: 1 }}>
              <ThemedText
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  marginBottom: 4,
                }}
              >
                {appointment.service.name}
              </ThemedText>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={theme.mutedForeground}
                />
                <ThemedText
                  style={{
                    fontSize: 13,
                    color: theme.mutedForeground,
                  }}
                >
                  {getRelativeTime()}
                </ThemedText>
              </View>
            </View>

            {/* Status Badge */}
            <View
              style={{
                backgroundColor: getStatusColor() + '20',
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 12,
              }}
            >
              <ThemedText
                style={{
                  fontSize: 11,
                  fontWeight: '600',
                  color: getStatusColor(),
                  textTransform: 'capitalize',
                }}
              >
                {isPast ? 'Completed' : appointment.status || 'Scheduled'}
              </ThemedText>
            </View>
          </View>

          {/* Date and Time */}
          <View style={{ marginBottom: 12 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                marginBottom: 6,
              }}
            >
              <Ionicons
                name="calendar-outline"
                size={16}
                color={theme.mutedForeground}
              />
              <ThemedText style={{ fontSize: 14, color: theme.foreground }}>
                {startDate.toLocaleString({
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </ThemedText>
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Ionicons
                name="time-outline"
                size={16}
                color={theme.mutedForeground}
              />
              <ThemedText style={{ fontSize: 14, color: theme.foreground }}>
                {startDate.toLocaleString(DateTime.TIME_SIMPLE)} -{' '}
                {endDate.toLocaleString(DateTime.TIME_SIMPLE)} ({duration} min)
              </ThemedText>
            </View>
          </View>

          {/* Staff Info */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              marginBottom: 12,
            }}
          >
            <Ionicons
              name="person-outline"
              size={16}
              color={theme.mutedForeground}
            />
            <ThemedText style={{ fontSize: 14, color: theme.foreground }}>
              {appointment.staffMember.firstName}{' '}
              {appointment.staffMember.lastName}
            </ThemedText>
          </View>

          {/* Meeting Type */}
          {appointment.service.isAvailableOnline && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                marginBottom: 16,
              }}
            >
              <Ionicons name="videocam" size={16} color={theme.primary} />
              <ThemedText style={{ fontSize: 14, color: theme.primary }}>
                Online Meeting
              </ThemedText>
            </View>
          )}

          {/* Comments if available */}
          {appointment.comments && (
            <View
              style={{
                backgroundColor: theme.muted + '30',
                padding: 10,
                borderRadius: theme.radius,
                marginBottom: 12,
              }}
            >
              <ThemedText
                style={{
                  fontSize: 13,
                  color: theme.mutedForeground,
                  fontStyle: 'italic',
                }}
              >
                &quot;{appointment.comments}&quot;
              </ThemedText>
            </View>
          )}

          {/* Action Buttons */}
          {!isPast && (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {/* Join Meeting Button - Only show if today and has link */}
              {canJoin && appointment.zoomMeetingLink && (
                <Button
                  onPress={handleJoinMeeting}
                  style={{ flex: 1 }}
                  size="sm"
                >
                  <ButtonIcon name="videocam" />
                  <ButtonText>Join Meeting</ButtonText>
                </Button>
              )}

              {/* Cancel Button - Only for upcoming appointments */}
              {isUpcoming && onCancel && (
                <Button
                  variant="destructive"
                  onPress={handleCancelPress}
                  style={{ flex: canJoin ? 0 : 1 }}
                  size="sm"
                  disabled={isCancelling}
                >
                  <ButtonIcon name="close-circle-outline" />
                  <ButtonText>Cancel</ButtonText>
                </Button>
              )}
            </View>
          )}

          {/* Past - Show meeting link if available */}
          {isPast && appointment.zoomMeetingLink && (
            <Button variant="outline" onPress={handleJoinMeeting} size="sm">
              <ButtonIcon name="link-outline" />
              <ButtonText>View Meeting Link</ButtonText>
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Cancel Modal */}
      <CancelAppointmentModal
        visible={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelConfirm}
        isLoading={isCancelling}
        appointmentTitle={appointment.service.name}
      />
    </TouchableOpacity>
  );
};
