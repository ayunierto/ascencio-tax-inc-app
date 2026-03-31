import React from 'react';
import {
  StyleProp,
  StyleSheet,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';

interface SimpleCardHeaderProps extends ViewProps {
  style?: StyleProp<ViewStyle>;
}

export const SimpleCardHeader = ({
  style,
  children,
}: SimpleCardHeaderProps) => {
  return <View style={[styles.simpleHeader, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  simpleHeader: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
});
