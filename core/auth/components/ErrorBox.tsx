import { theme } from '@/components/ui/theme';
import ErrorMessage from '@/core/components/ErrorMessage';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface ErrorBoxProps {
  message?: string;
}

export const ErrorBox: React.FC<ErrorBoxProps> = ({ message }) => {
  if (!message) return null;

  return (
    <View style={styles.errorBox}>
      <ErrorMessage message={message} />
    </View>
  );
};

const styles = StyleSheet.create({
  errorBox: {
    marginBottom: 8,
    borderRadius: theme.radius,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.destructive + '33',
    backgroundColor: theme.destructive + '11',
    padding: 10,
  },
});
