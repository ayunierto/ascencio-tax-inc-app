import React from 'react';
import {
  StyleProp,
  StyleSheet,
  TextProps,
  Text,
  TextStyle,
} from 'react-native';
import { theme } from '../theme';

interface SimpleCardHeaderSubTitleProps extends TextProps {
  style?: StyleProp<TextStyle>;
}

export const SimpleCardHeaderSubTitle = ({
  style,
  children,
}: SimpleCardHeaderSubTitleProps) => {
  return <Text style={[styles.title, style]}>{children}</Text>;
};

const styles = StyleSheet.create({
  title: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: theme.muted,
  },
});
