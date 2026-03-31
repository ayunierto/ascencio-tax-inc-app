// src/components/BasicMaterialInput.tsx
import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps, // Import standard TextInputProps
  ViewStyle, // Import style types
  TextStyle,
} from 'react-native';

interface BasicMaterialInputProps extends TextInputProps {
  label?: string; // Optional label/placeholder
  error?: boolean; // Optional error state flag
  containerStyle?: ViewStyle; // Style for the outer View
  inputStyle?: TextStyle; // Style for the TextInput itself
  errorTextStyle?: TextStyle; // Style for the error message text
  helperText?: string; // Optional helper text
  errorMessage?: string; // Optional error message to display
}

const BasicMaterialInput: React.FC<BasicMaterialInputProps> = ({
  label,
  error,
  containerStyle,
  inputStyle,
  errorTextStyle,
  helperText,
  errorMessage,
  onFocus, // Capture standard onFocus/onBlur
  onBlur,
  style, // Capture style prop applied directly to TextInput
  ...rest // Capture other TextInputProps (value, onChangeText, keyboardType, secureTextEntry, etc.)
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // Handlers to update the focus state
  const _handleFocus = (event: any) => {
    setIsFocused(true);
    onFocus?.(event); // Call the original onFocus prop if provided
  };

  const _handleBlur = (event: any) => {
    setIsFocused(false);
    onBlur?.(event); // Call the original onBlur prop if provided
  };

  // Determine the color and thickness of the bottom border based on state and error prop
  const borderColor = error ? 'red' : isFocused ? 'blue' : '#ccc'; // Red for error, blue for focused, gray for default
  const borderWidth = isFocused || error ? 2 : 1; // Thicker when focused or error

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Basic Label/Placeholder above the input */}
      {/* This is a simple approach, not the floating label animation */}
      {label &&
        !isFocused &&
        !rest.value && ( // Show label only when not focused and has no value
          <Text style={styles.placeholder}>{label}</Text>
        )}
      {/* If you wanted a simple label *always* above the input: */}
      {/* {label && <Text style={styles.label}>{label}</Text>} */}

      <TextInput
        style={[
          styles.input,
          inputStyle,
          style, // Apply the style prop directly to TextInput
          {
            borderBottomColor: borderColor, // Apply conditional border color
            borderBottomWidth: borderWidth, // Apply conditional border thickness
          },
        ]}
        placeholder={!isFocused || rest.value ? label : undefined} // Only show placeholder when not focused OR has value (basic behavior)
        onFocus={_handleFocus} // Use custom focus handler
        onBlur={_handleBlur} // Use custom blur handler
        placeholderTextColor="#888" // Optional: Style placeholder color
        underlineColorAndroid="transparent" // Hide default Android underline
        {...rest} // Spread other TextInputProps (value, onChangeText, etc.)
      />

      {/* Helper or Error Text */}
      {(helperText || errorMessage) && (
        <Text
          style={[
            styles.helperText,
            error ? styles.errorText : null,
            errorTextStyle,
          ]}
        >
          {error ? errorMessage : helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%', // Take full width by default
    marginBottom: 20, // Space below the input
  },
  placeholder: {
    position: 'absolute', // Simple positioning example
    left: 0,
    top: 0, // Adjust position as needed
    fontSize: 16,
    color: '#888', // Placeholder color
    // Note: Making this position absolute might overlap with input text depending on layout
    // A true Material Design label involves more complex positioning or animation
  },
  input: {
    height: 40, // Basic height
    paddingHorizontal: 0, // Remove default horizontal padding
    paddingTop: 10, // Add some padding top to make space for potential label/placeholder
    paddingBottom: 5, // Add some padding bottom for the underline space
    fontSize: 18, // Basic font size
    color: '#333', // Text color
    // borderBottomStyle: 'solid', // Ensure border style is solid

    // Default border styles defined inline based on state/props
    // borderBottomColor: determined by logic
    // borderBottomWidth: determined by logic
  },
  helperText: {
    marginTop: 4, // Space above helper text
    fontSize: 12, // Smaller font size
    color: '#888', // Default helper text color
  },
  errorText: {
    color: 'red', // Red color for error text
  },
});

export default BasicMaterialInput;
