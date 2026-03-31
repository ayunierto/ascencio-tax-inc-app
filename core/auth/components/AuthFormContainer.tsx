import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AuthFormContainerProps {
  children: React.ReactNode;
  maxWidth?: number;
  showTopSpacing?: boolean;
}

const FORM_MAX_WIDTH = 380;
const SMALL_TOP_SPACING = 20;

export const AuthFormContainer: React.FC<AuthFormContainerProps> = ({
  children,
  maxWidth = FORM_MAX_WIDTH,
  showTopSpacing = true,
}) => {
  const insets = useSafeAreaInsets();

  const formContainerStyle: ViewStyle = {
    ...styles.formContainer,
    maxWidth,
    marginTop: showTopSpacing ? 0 : SMALL_TOP_SPACING,
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={formContainerStyle}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  formContainer: {
    flex: 1,
    gap: 20,
    width: '100%',
    marginHorizontal: 'auto',
    marginBottom: 20,
    padding: 10,
  },
});
