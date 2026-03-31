import { theme } from '@/components/ui/theme';
import { ThemedText } from '@/components/ui/ThemedText';
import React from 'react';

import { StyleSheet, TextProps } from 'react-native';

export const MetricsListValue = ({ children, style }: TextProps) => {
  return (
    <ThemedText style={[styles.metricValue, style]}>{children}</ThemedText>
  );
};

const styles = StyleSheet.create({
  metricValue: {
    fontWeight: 'bold',
    color: theme.foreground,
  },
});
