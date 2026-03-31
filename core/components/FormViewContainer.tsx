import { theme } from '@/components/ui';
import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FormViewContainerProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const FormViewContainer = ({
  children,
  style,
}: FormViewContainerProps) => {
  const { bottom } = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 80}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: bottom }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[{ flex: 1, gap: theme.gap, padding: 10 }, style]}>
          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
