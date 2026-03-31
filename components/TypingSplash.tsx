// src/components/TypingSplash.tsx o donde prefieras
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
// You might need expo-splash-screen if you are controlling the native splash screen hiding here
// import * as SplashScreen from 'expo-splash-screen';

interface TypingSplashProps {
  text: string; // The full text to type
  typingSpeed?: number; // Speed in milliseconds per character (default 50)
  cursor?: string; // Cursor character (default '|')
  cursorBlinkSpeed?: number; // Cursor blink speed in milliseconds (default 500)
  onAnimationComplete?: () => void; // Optional callback function when typing is done
  // Add style props if needed
}

const TypingSplash: React.FC<TypingSplashProps> = ({
  text,
  typingSpeed = 50,
  cursor = '|',
  cursorBlinkSpeed = 500,
  onAnimationComplete,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  useEffect(() => {
    // Optional: Hide the native splash screen if this component is shown right after it hides
    // async function prepare() {
    //   try {
    //     await SplashScreen.preventAutoHideAsync(); // Keep native splash screen visible
    //     // Load fonts, make API calls, etc.
    //   } catch (e) {
    //     console.warn(e);
    //   } finally {
    //     // When ready, hide the native splash screen
    //     await SplashScreen.hideAsync();
    //   }
    // }
    // prepare();

    let currentText = '';
    let index = 0;
    let typingTimer: ReturnType<typeof setTimeout>;

    // Function to add one character
    const type = () => {
      if (index < text.length) {
        currentText += text.charAt(index);
        setDisplayedText(currentText);
        index++;
        // Schedule the next character typing
        typingTimer = setTimeout(type, typingSpeed);
      } else {
        // Typing is finished
        setIsTypingComplete(true);
        // Call the completion callback after a short delay if provided
        if (onAnimationComplete) {
          // Add a slight pause after typing is complete before calling the callback
          setTimeout(onAnimationComplete, 500); // 500ms pause example
        }
      }
    };

    // Start the typing effect
    type();

    // Cleanup function for the typing timer
    return () => {
      clearTimeout(typingTimer);
    };
  }, [text, typingSpeed, onAnimationComplete]); // Re-run effect if text or speed changes

  useEffect(() => {
    // Cursor blinking logic
    let cursorTimer: ReturnType<typeof setInterval>;

    if (!isTypingComplete) {
      // Blink cursor only while typing
      cursorTimer = setInterval(() => {
        setShowCursor((prev) => !prev);
      }, cursorBlinkSpeed);
    } else {
      // After typing is complete, decide if cursor should stay visible or disappear
      // For this example, let's make it visible and stop blinking
      setShowCursor(true);
    }

    // Cleanup function for the cursor timer
    return () => {
      clearInterval(cursorTimer);
    };
  }, [cursorBlinkSpeed, isTypingComplete]); // Re-run effect if blink speed changes or typing completes

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {displayedText}
        {/* Render cursor only while typing, or decide if it stays after */}
        {/* {showCursor && !isTypingComplete && <Text style={styles.cursor}>{cursor}</Text>} // Blink only while typing */}
        {showCursor && <Text style={styles.cursor}>{cursor}</Text>}{' '}
        {/* Always show/blink cursor next to text */}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Take up available space
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
    backgroundColor: '#fff', // Background color of your splash screen
    // Add padding or margin if needed
  },
  text: {
    fontSize: 24, // Adjust font size
    fontFamily: 'monospace', // Use a monospace font for consistent character width
    // Add other text styling
  },
  cursor: {
    fontSize: 24, // Match text size
    // No animation needed here, blinking is controlled by showCursor state
  },
});

export default TypingSplash;
