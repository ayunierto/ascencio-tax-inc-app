import React from 'react';
import {
  View,
  ViewProps,
  StyleProp,
  ViewStyle,
  StyleSheet,
  TextStyle,
} from 'react-native';
import { theme } from '../theme';
import { ThemedText } from '../ThemedText';

interface CardProps extends ViewProps {
  style?: StyleProp<ViewStyle>;
}

export const Card = ({ style, children, ...props }: CardProps) => {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
};

export const CardHeader = ({ style, children, ...props }: CardProps) => {
  return (
    <View
      style={[
        {
          padding: 15,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: theme.border,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

export const CardTitle = ({
  style,
  children,
  ...props
}: {
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
}) => {
  return (
    <ThemedText
      {...props}
      style={[{ fontSize: 16, fontWeight: 'bold' }, style]}
    >
      {children}
    </ThemedText>
  );
};

export const CardDescription = ({
  style,
  children,
  ...props
}: {
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
}) => {
  return (
    <ThemedText
      {...props}
      style={[{ fontSize: 14, color: theme.muted }, style]}
    >
      {children}
    </ThemedText>
  );
};

interface CardContentProps extends ViewProps {
  style?: StyleProp<ViewStyle>;
}

export const CardContent = ({
  style,
  children,
  ...props
}: CardContentProps) => {
  return (
    <View style={[styles.cardContent, style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.card,
    borderRadius: theme.radius,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 15,
  },
});
