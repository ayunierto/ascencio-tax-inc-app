import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';

import { theme } from '@/components/ui/theme';

interface ConfirmImageButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export const ConfirmImageButton = ({
  onPress,
  disabled,
  loading,
}: ConfirmImageButtonProps) => {
  const dimensions = useWindowDimensions();
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={disabled || loading ? () => {} : onPress}
      style={[
        styles.shutterButton,
        {
          position: 'absolute',
          bottom: 30,
          left: dimensions.width / 2 - 32,
          borderColor: theme.primary,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={theme.primary} />
      ) : (
        <Ionicons name="checkmark-outline" size={30} color={theme.primary} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  shutterButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'white',
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
