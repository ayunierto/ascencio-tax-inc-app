import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type StyleProp,
  type TextInputFocusEventData,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { theme } from './theme';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  leadingIcon?: keyof typeof Ionicons.glyphMap;
  trailingIcon?: keyof typeof Ionicons.glyphMap;
  error?: boolean;
  errorMessage?: string;
  helperText?: string;
  style?: StyleProp<ViewStyle>;
  rootStyle?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  errorTextStyle?: StyleProp<TextStyle>;
  focusedBorderColor?: string;
  clearable?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      value = '',
      placeholder,
      leadingIcon,
      trailingIcon,
      error,
      errorMessage,
      helperText,
      style,
      rootStyle,
      containerStyle,
      inputStyle,
      labelStyle,
      errorTextStyle,
      focusedBorderColor = theme.primary,
      onFocus,
      onBlur,
      editable = true,
      clearable = false,
      ...props
    },
    forwardedRef,
  ) => {
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const internalRef = useRef<TextInput>(null);

    const textInputRef = forwardedRef || internalRef;

    const animatedValue = useRef(new Animated.Value(0)).current;

    const [isPasswordVisible, setIsPasswordVisible] = useState(
      props.secureTextEntry || false,
    );

    const hasValue = value && value.length > 0;
    const shouldFloat = isFocused || hasValue;

    useEffect(() => {
      Animated.timing(animatedValue, {
        toValue: shouldFloat ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }, [shouldFloat, animatedValue]);

    const handleFocus = (
      event: NativeSyntheticEvent<TextInputFocusEventData>,
    ): void => {
      setIsFocused(true);
      onFocus?.(event);
    };

    const handleBlur = (
      event: NativeSyntheticEvent<TextInputFocusEventData>,
    ): void => {
      setIsFocused(false);
      onBlur?.(event);
    };

    const computedContainerStyle = useMemo<StyleProp<ViewStyle>>(() => {
      const borderColor = !editable
        ? theme.mutedForeground
        : error
          ? theme.destructive
          : isFocused
            ? focusedBorderColor
            : theme.border;

      const borderWidth = error ? 2 : 1;

      return [
        styles.containerBase,
        { borderColor, borderWidth },
        containerStyle,
      ];
    }, [isFocused, error, editable, focusedBorderColor, containerStyle]);

    const animatedLabelStyles = useMemo(() => {
      const translateY = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -26],
      });

      const scale = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0.85],
      });

      const color = error
        ? theme.destructive
        : animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [theme.muted, focusedBorderColor],
          });

      return [
        styles.labelBase,
        labelStyle,
        { color },
        { transform: [{ translateY }, { scale }] },
      ];
    }, [animatedValue, labelStyle, error, focusedBorderColor]);

    const computedInputStyle = useMemo<StyleProp<TextStyle>>(() => {
      return [
        styles.inputBase,
        { color: !editable ? theme.mutedForeground : theme.primaryForeground },
        inputStyle,
      ];
    }, [editable, inputStyle]);

    const computedRootStyle = useMemo<StyleProp<ViewStyle>>(() => {
      return [styles.root, style, rootStyle];
    }, [style, rootStyle]);

    const handleTogglePasswordVisibility = () => {
      setIsPasswordVisible((prev) => !prev);
    };

    return (
      <View style={computedRootStyle}>
        <View style={computedContainerStyle}>
          <View style={styles.inputWrapper}>
            {leadingIcon && (
              <Ionicons
                name={leadingIcon}
                size={24}
                color={theme.primaryForeground}
                style={[
                  styles.icon,
                  error ? [styles.errorText, errorTextStyle] : null,
                ]}
              />
            )}

            <View style={styles.inputArea}>
              {label && (
                <Animated.Text
                  style={animatedLabelStyles}
                  onPress={() => {
                    if (
                      typeof textInputRef === 'object' &&
                      textInputRef?.current
                    ) {
                      textInputRef.current.focus();
                    }
                  }}
                >
                  {label}
                </Animated.Text>
              )}

              <TextInput
                ref={textInputRef as any}
                style={computedInputStyle}
                value={value}
                onFocus={handleFocus as any}
                onBlur={handleBlur as any}
                editable={editable}
                placeholder={!label ? placeholder : ''}
                placeholderTextColor={theme.muted}
                underlineColorAndroid='transparent'
                {...props}
                secureTextEntry={isPasswordVisible}
              />
            </View>

            {trailingIcon && (
              <Ionicons
                name={trailingIcon}
                size={24}
                color={theme.primaryForeground}
                style={styles.icon}
              />
            )}

            {clearable && hasValue && editable && (
              <Ionicons
                style={{ backgroundColor: 'transparent', padding: 6 }}
                name='close-circle-outline'
                size={20}
                color={theme.muted}
                onPress={() => {
                  if (
                    typeof textInputRef === 'object' &&
                    textInputRef?.current
                  ) {
                    textInputRef.current.clear();
                    props.onChangeText?.('');
                  }
                }}
              />
            )}

            {props.secureTextEntry && (
              <Ionicons
                name={isPasswordVisible ? 'eye' : 'eye-off'}
                size={24}
                color={theme.primaryForeground}
                style={styles.icon}
                onPress={handleTogglePasswordVisibility}
              />
            )}
          </View>
        </View>

        {helperText && (
          <Text style={[styles.helperTextBase]}>{helperText}</Text>
        )}

        {errorMessage && (
          <Text
            style={[
              styles.helperTextBase,
              error ? [styles.errorText, errorTextStyle] : null,
            ]}
          >
            {error ? errorMessage : helperText}
          </Text>
        )}
      </View>
    );
  },
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  root: {
    width: '100%',
    // marginBottom: 16,
  },
  containerBase: {
    borderRadius: theme.radius,
    height: 54,
    paddingHorizontal: 14,
    backgroundColor: theme.background,
    borderWidth: 1,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputArea: {
    flex: 1,
    justifyContent: 'center',
  },
  labelBase: {
    position: 'absolute',
    left: 0,
    backgroundColor: theme.background,
    paddingHorizontal: 6,
    fontSize: 14,
    fontWeight: '500',
    borderRadius: theme.radius,
  },
  inputBase: {
    height: '100%',
    fontSize: 16,
    paddingVertical: 0,
  },
  icon: {},
  helperTextBase: {
    marginTop: 4,
    fontSize: 13,
    paddingLeft: 4,
    color: theme.mutedForeground,
  },
  errorText: {
    color: theme.destructive,
  },
});
