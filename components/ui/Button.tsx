import { theme } from '@/components/ui/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';

// === Variants ===
type ButtonVariant =
  | 'default'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'destructive'
  | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  isLoading?: boolean;
}

// === Container cva style ===
const buttonVariants = ({
  variant,
  size,
}: {
  variant: ButtonVariant;
  size: ButtonSize;
}): ViewStyle[] => {
  const base: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius,
    marginVertical: 6,
  };

  const variants: Record<ButtonVariant, ViewStyle> = {
    default: { backgroundColor: theme.primary },
    destructive: { backgroundColor: theme.destructive },
    outline: {
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: 'transparent',
    },
    secondary: { backgroundColor: theme.secondary },
    ghost: { backgroundColor: 'transparent' },
    link: { backgroundColor: 'transparent' },
  };

  const sizes: Record<ButtonSize, ViewStyle> = {
    default: { paddingVertical: 10, paddingHorizontal: 16 },
    sm: { paddingVertical: 6, paddingHorizontal: 12 },
    lg: { paddingVertical: 14, paddingHorizontal: 20 },
    icon: { padding: 10 },
  };

  return [base, variants[variant], sizes[size]];
};

// === Texto estilo cva ===
const buttonTextVariants = ({
  variant,
  size,
}: {
  variant: ButtonVariant;
  size: ButtonSize;
}): TextStyle[] => {
  const base: TextStyle = {
    fontWeight: '500',
    textAlign: 'center',
  };

  const variants: Record<ButtonVariant, TextStyle> = {
    default: { color: theme.primaryForeground },
    destructive: { color: theme.destructiveForeground },
    outline: { color: theme.foreground },
    secondary: { color: theme.secondaryForeground },
    ghost: { color: theme.foreground },
    link: { color: theme.primary, textDecorationLine: 'underline' },
  };

  const sizes: Record<ButtonSize, TextStyle> = {
    default: { fontSize: 16 },
    sm: { fontSize: 14 },
    lg: { fontSize: 18 },
    icon: { fontSize: 0 }, // sin texto
  };

  return [base, variants[variant], sizes[size]];
};

// === Button ===
export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'default',
  disabled = false,
  fullWidth = false,
  children,
  onPress,
  style,
  isLoading = false,
}) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        ...buttonVariants({ variant, size }),
        fullWidth && { alignSelf: 'stretch' },
        disabled && { opacity: 0.6 },
        pressed && !disabled && { opacity: 0.9 },
        { gap: 10 },
        // custom styles
        style,
      ]}
    >
      {isLoading && <ActivityIndicator size="small" color={theme.foreground} />}
      {children}
    </Pressable>
  );
};

export const ButtonText: React.FC<{
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
}> = ({ variant = 'default', size = 'default', children, style }) => {
  return (
    <Text style={[buttonTextVariants({ variant, size }), style]}>
      {children}
    </Text>
  );
};

export const ButtonIcon: React.FC<{
  variant?: ButtonVariant;
  size?: ButtonSize;
  name: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<TextStyle>;
}> = ({ variant = 'default', size = 'lg', name, style }) => {
  return (
    <Ionicons
      name={name}
      // size={24}
      style={[buttonTextVariants({ variant, size }), style]}
    />
  );
};
