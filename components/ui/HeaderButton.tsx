import React, { useState } from 'react';
import { TouchableWithoutFeedback, View, ViewStyle } from 'react-native';

interface HeaderButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
  disabled?: boolean;
  hitSlop?:
    | number
    | { top?: number; bottom?: number; left?: number; right?: number };
}

/**
 * Header button optimized for iOS to avoid border rendering issues
 * and improve touch target area.
 */
export function HeaderButton({
  onPress,
  children,
  style,
  disabled = false,
  hitSlop = 10,
}: HeaderButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const hitSlopValue =
    typeof hitSlop === 'number'
      ? { top: hitSlop, bottom: hitSlop, left: hitSlop, right: hitSlop }
      : hitSlop;

  return (
    <TouchableWithoutFeedback
      onPress={disabled ? undefined : onPress}
      onPressIn={disabled ? undefined : () => setIsPressed(true)}
      onPressOut={disabled ? undefined : () => setIsPressed(false)}
      hitSlop={hitSlopValue}
      disabled={disabled}
    >
      <View style={[style, { opacity: disabled ? 0.3 : isPressed ? 0.5 : 1 }]}>
        {children}
      </View>
    </TouchableWithoutFeedback>
  );
}
