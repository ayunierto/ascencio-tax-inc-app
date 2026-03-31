import {
  View,
  Text,
  type ViewProps,
  ViewStyle,
  StyleProp,
  TextStyle,
} from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { theme } from './theme';
import { StyleSheet } from 'react-native';

interface AlertProps extends ViewProps {
  variant?: 'info' | 'warning' | 'error' | 'success';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Alert = ({
  variant = 'info',
  children,
  style,
  textStyle,
  ...props
}: AlertProps) => {
  const variantStyles = {
    info: styles.info,
    warning: styles.warning,
    error: styles.error,
    success: styles.success,
  };

  return (
    <View style={[styles.alert, variantStyles[variant], style]} {...props}>
      <Ionicons
        name={
          variant === 'info'
            ? 'information-circle-outline'
            : variant === 'warning'
              ? 'warning-outline'
              : variant === 'success'
                ? 'checkmark-circle-outline'
                : 'alert-circle-outline'
        }
        size={24}
        color="white"
      />
      <Text style={[styles.textAlert, textStyle]}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  alert: {
    borderRadius: theme.radius,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  textAlert: {
    flex: 1,
    color: theme.foreground,
  },
  info: {
    backgroundColor: theme.primary,
  },
  warning: {
    backgroundColor: '#f97316',
  },
  error: {
    backgroundColor: theme.destructive,
  },
  success: {
    backgroundColor: '#22c55e',
  },
});

export default Alert;
