import { theme } from '@/components/ui/theme';
import { ThemedText } from '@/components/ui/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';

interface Step {
  number: number;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface BookingProgressStepperProps {
  currentStep: number;
  steps?: Step[];
}

const DEFAULT_STEPS: Step[] = [
  { number: 1, label: 'Select', icon: 'calendar-outline' },
  { number: 2, label: 'Details', icon: 'clipboard-outline' },
  { number: 3, label: 'Review', icon: 'checkmark-circle-outline' },
];

export const BookingProgressStepper = ({
  currentStep,
  steps = DEFAULT_STEPS,
}: BookingProgressStepperProps) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        marginBottom: 20,
      }}
    >
      {steps.map((step, index) => {
        const isActive = currentStep === step.number;
        const isCompleted = currentStep > step.number;
        const isLast = index === steps.length - 1;

        return (
          <React.Fragment key={step.number}>
            {/* Step Circle */}
            <View style={{ alignItems: 'center', flex: 1 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: isCompleted
                    ? theme.success
                    : isActive
                      ? theme.primary
                      : theme.muted,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                {isCompleted ? (
                  <Ionicons
                    name="checkmark"
                    size={24}
                    color={theme.background}
                  />
                ) : (
                  <Ionicons
                    name={step.icon}
                    size={20}
                    color={isActive ? theme.primaryForeground : theme.mutedForeground}
                  />
                )}
              </View>

              {/* Step Label */}
              <ThemedText
                style={{
                  fontSize: 11,
                  fontWeight: isActive || isCompleted ? '600' : '400',
                  color: isActive || isCompleted
                    ? theme.foreground
                    : theme.mutedForeground,
                  textAlign: 'center',
                }}
              >
                {step.label}
              </ThemedText>
            </View>

            {/* Connector Line */}
            {!isLast && (
              <View
                style={{
                  height: 2,
                  flex: 0.5,
                  backgroundColor: isCompleted ? theme.success : theme.muted,
                  marginBottom: 30,
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};
