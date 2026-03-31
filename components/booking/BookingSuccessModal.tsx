import { Ionicons } from "@expo/vector-icons";
import { DateTime } from "luxon";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { Button, ButtonIcon, ButtonText } from "@/components/ui/Button";
import { theme } from "@/components/ui/theme";
import { ThemedText } from "@/components/ui/ThemedText";
import { Appointment } from "@/core/appointments/interfaces/appointmentResponse";

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
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const confettiAnims = useRef(
    Array.from({ length: 15 }, () => ({
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      opacity: new Animated.Value(1),
      rotate: new Animated.Value(0),
    }))
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

  // TODO: Implement add to calendar functionality
  // Use expo-calendar to add the appointment to the device's calendar
  // const handleAddToCalendar = async () => {
  //   try {
  //     const { status } = await Calendar.requestCalendarPermissionsAsync();
  //     if (status === 'granted') {
  //       const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  //       const defaultCalendar = calendars.find(cal => cal.isPrimary) || calendars[0];
  //
  //       await Calendar.createEventAsync(defaultCalendar.id, {
  //         title: appointment.service.name,
  //         startDate: new Date(appointment.start),
  //         endDate: new Date(appointment.end),
  //         location: appointment.service.address,
  //         notes: appointment.comments,
  //         alarms: [{ relativeOffset: -60 }], // 1 hour before
  //       });
  //
  //       Toast.show({
  //         type: 'success',
  //         text1: 'Added to calendar',
  //         text2: 'Your appointment has been added to your calendar',
  //       });
  //     }
  //   } catch (error) {
  //     Toast.show({
  //       type: 'error',
  //       text1: 'Error',
  //       text2: 'Could not add to calendar',
  //     });
  //   }
  // };

  const startDate = DateTime.fromISO(appointment.start);
  const now = DateTime.now();
  const diff = startDate.diff(now, ["days", "hours", "minutes"]);

  const getCountdown = () => {
    if (diff.days >= 1) {
      return `${Math.floor(diff.days)} ${Math.floor(diff.days) === 1 ? "day" : "days"}`;
    } else if (diff.hours >= 1) {
      return `${Math.floor(diff.hours)} ${Math.floor(diff.hours) === 1 ? "hour" : "hours"}`;
    } else {
      return `${Math.floor(diff.minutes)} minutes`;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
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
                  "#FFD700",
                  "#FF6B9D",
                  "#9B59B6",
                ][index % 5],
                transform: [
                  { translateY: anim.translateY },
                  { translateX: anim.translateX },
                  {
                    rotate: anim.rotate.interpolate({
                      inputRange: [0, 360],
                      outputRange: ["0deg", "360deg"],
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
                name="checkmark-circle"
                size={80}
                color={theme.success}
              />
            </View>
          </View>

          {/* Title */}
          <ThemedText style={styles.title}>Booking Confirmed!</ThemedText>
          <ThemedText style={styles.subtitle}>
            Your appointment has been successfully scheduled
          </ThemedText>

          {/* Appointment Details Card */}
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar" size={20} color={theme.primary} />
              <ThemedText style={styles.detailText}>
                {startDate.toLocaleString(DateTime.DATE_HUGE)}
              </ThemedText>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="time" size={20} color={theme.primary} />
              <ThemedText style={styles.detailText}>
                {startDate.toFormat("h:mm a")} -{" "}
                {DateTime.fromISO(appointment.end).toFormat("h:mm a")}
              </ThemedText>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="person" size={20} color={theme.primary} />
              <ThemedText style={styles.detailText}>
                {appointment.staffMember.firstName}{" "}
                {appointment.staffMember.lastName}
              </ThemedText>
            </View>

            {appointment.service.isAvailableOnline &&
              appointment.zoomMeetingLink && (
                <View style={styles.detailRow}>
                  <Ionicons name="videocam" size={20} color={theme.primary} />
                  <ThemedText style={styles.detailText}>
                    Online Meeting
                  </ThemedText>
                </View>
              )}
          </View>

          {/* Countdown */}
          <View style={styles.countdownContainer}>
            <ThemedText style={styles.countdownLabel}>
              Your appointment is in:
            </ThemedText>
            <ThemedText style={styles.countdownValue}>
              {getCountdown()}
            </ThemedText>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            {/* TODO: Uncomment when calendar functionality is implemented
            <Button
              variant="outline"
              onPress={handleAddToCalendar}
              style={styles.button}
            >
              <ButtonIcon name="calendar-outline" />
              <ButtonText>Add to Calendar</ButtonText>
            </Button>
            */}

            <Button onPress={onViewAppointments} style={styles.button}>
              <ButtonIcon name="list-outline" />
              <ButtonText>View My Bookings</ButtonText>
            </Button>
          </View>

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <ThemedText style={styles.closeText}>Done</ThemedText>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  confetti: {
    position: "absolute",
    top: -20,
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  modalContent: {
    backgroundColor: theme.background,
    borderRadius: theme.radius * 3,
    padding: 30,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  iconContainer: {
    marginBottom: 20,
  },
  successCircle: {
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: theme.mutedForeground,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  detailsCard: {
    width: "100%",
    backgroundColor: theme.card,
    borderRadius: theme.radius,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailText: {
    fontSize: 15,
    flex: 1,
  },
  countdownContainer: {
    width: "100%",
    backgroundColor: theme.primary + "15",
    borderRadius: theme.radius,
    padding: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  countdownLabel: {
    fontSize: 13,
    color: theme.mutedForeground,
    marginBottom: 4,
  },
  countdownValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.primary,
  },
  buttonsContainer: {
    width: "100%",
    gap: 12,
    marginBottom: 16,
  },
  button: {
    width: "100%",
  },
  closeButton: {
    padding: 12,
  },
  closeText: {
    fontSize: 16,
    color: theme.mutedForeground,
    fontWeight: "500",
  },
});
