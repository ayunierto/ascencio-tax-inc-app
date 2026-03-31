import React from 'react';

import { StyleSheet, View, ViewProps } from 'react-native';

export const MetricsList = ({ children, style }: ViewProps) => {
  return <View style={[styles.metrics, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
});
