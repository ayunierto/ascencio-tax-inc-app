import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Button, ButtonText } from "@/components/ui/Button";
import { theme } from "@/components/ui/theme";
import { ThemedText } from "@/components/ui/ThemedText";

interface CancelAppointmentModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading?: boolean;
  appointmentTitle?: string;
}

const CANCEL_REASONS = [
  "Schedule conflict",
  "No longer needed",
  "Found another provider",
  "Personal reasons",
  "Weather/Transportation issues",
  "Health issues",
  "Other",
];

export const CancelAppointmentModal = ({
  visible,
  onClose,
  onConfirm,
  isLoading = false,
  appointmentTitle,
}: CancelAppointmentModalProps) => {
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const handleConfirm = () => {
    const reason = selectedReason === "Other" ? customReason : selectedReason;
    onConfirm(reason);
  };

  const handleClose = () => {
    setSelectedReason("");
    setCustomReason("");
    onClose();
  };

  const isValid =
    selectedReason && (selectedReason !== "Other" || customReason.trim());

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={handleClose}
          />
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.iconContainer}>
                  <Ionicons
                    name="alert-circle"
                    size={48}
                    color={theme.destructive}
                  />
                </View>
                <ThemedText style={styles.title}>
                  Cancel Appointment?
                </ThemedText>
                {appointmentTitle && (
                  <ThemedText style={styles.subtitle}>
                    {appointmentTitle}
                  </ThemedText>
                )}
              </View>

              {/* Reasons */}
              <View style={styles.reasonsContainer}>
                <ThemedText style={styles.label}>
                  Please select a reason for cancellation:
                </ThemedText>
                {CANCEL_REASONS.map((reason) => (
                  <TouchableOpacity
                    key={reason}
                    style={[
                      styles.reasonOption,
                      selectedReason === reason && styles.reasonOptionSelected,
                    ]}
                    onPress={() => setSelectedReason(reason)}
                  >
                    <View
                      style={[
                        styles.radio,
                        selectedReason === reason && styles.radioSelected,
                      ]}
                    >
                      {selectedReason === reason && (
                        <View style={styles.radioInner} />
                      )}
                    </View>
                    <ThemedText
                      style={[
                        styles.reasonText,
                        selectedReason === reason && styles.reasonTextSelected,
                      ]}
                    >
                      {reason}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Custom reason input */}
              {selectedReason === "Other" && (
                <View style={styles.customReasonContainer}>
                  <ThemedText style={styles.label}>Please specify:</ThemedText>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your reason..."
                    placeholderTextColor={theme.mutedForeground}
                    value={customReason}
                    onChangeText={setCustomReason}
                    multiline
                    numberOfLines={3}
                    maxLength={200}
                    textAlignVertical="top"
                  />
                  <ThemedText style={styles.charCount}>
                    {customReason.length}/200
                  </ThemedText>
                </View>
              )}

              {/* Warning */}
              <View style={styles.warningContainer}>
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color={theme.mutedForeground}
                />
                <ThemedText style={styles.warningText}>
                  This action cannot be undone. You&apos;ll need to book a new
                  appointment if you change your mind.
                </ThemedText>
              </View>

              {/* Buttons */}
              <View style={styles.buttonsContainer}>
                <Button
                  variant="outline"
                  onPress={handleClose}
                  style={styles.button}
                  disabled={isLoading}
                >
                  <ButtonText>Keep Appointment</ButtonText>
                </Button>
                <Button
                  variant="destructive"
                  onPress={handleConfirm}
                  style={styles.button}
                  disabled={!isValid || isLoading}
                  isLoading={isLoading}
                >
                  <ButtonText>
                    {isLoading ? "Cancelling..." : "Yes, Cancel"}
                  </ButtonText>
                </Button>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalContent: {
    backgroundColor: theme.background,
    borderRadius: theme.radius * 2,
    padding: 20,
    width: "100%",
    maxWidth: 600,
    maxHeight: "90%",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: theme.mutedForeground,
    textAlign: "center",
  },
  reasonsContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    color: theme.foreground,
  },
  reasonOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 8,
    backgroundColor: theme.card,
  },
  reasonOptionSelected: {
    borderColor: theme.primary,
    backgroundColor: theme.primary + "10",
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.border,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: {
    borderColor: theme.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.primary,
  },
  reasonText: {
    fontSize: 15,
    color: theme.foreground,
    flex: 1,
  },
  reasonTextSelected: {
    color: theme.primary,
    fontWeight: "500",
  },
  customReasonContainer: {
    marginBottom: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: theme.radius,
    padding: 12,
    fontSize: 15,
    color: theme.foreground,
    backgroundColor: theme.card,
    minHeight: 80,
  },
  charCount: {
    fontSize: 12,
    color: theme.mutedForeground,
    textAlign: "right",
    marginTop: 4,
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: theme.muted + "30",
    padding: 12,
    borderRadius: theme.radius,
    marginBottom: 20,
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: theme.mutedForeground,
    lineHeight: 18,
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
  },
});
