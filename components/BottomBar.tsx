import React from 'react';
import { theme } from './ui/theme';
import { View } from 'react-native';

export const BottomBar: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <View
      style={{
        paddingVertical: 6,
        borderTopWidth: 1,
        borderTopColor: theme.border,
        backgroundColor: theme.background,
      }}
    >
      {children}
    </View>
  );
};
