import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

interface AppointmentsBottomActionProps {
  bottomInset: number;
  children: ReactNode;
}

export function AppointmentsBottomAction({
  bottomInset,
  children,
}: AppointmentsBottomActionProps) {
  return <View style={[styles.container, { bottom: bottomInset + 16 }]}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
});
