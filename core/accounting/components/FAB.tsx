import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

type Action = {
  icon: React.ReactNode;
  onPress: () => void;
};

type FabProps = {
  actions: Action[];
};

export const Fab = ({ actions }: FabProps) => {
  const [open, setOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    const toValue = open ? 0 : 1;
    Animated.spring(animation, {
      toValue,
      useNativeDriver: true,
    }).start();
    setOpen(!open);
  };

  const rotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <View style={styles.container}>
      {/* Actions */}
      {actions.map((action, index) => {
        const translateY = animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -(index + 1) * 70],
        });
        return (
          <Animated.View
            key={index}
            style={[
              styles.action,
              {
                transform: [{ translateY }],
                opacity: animation,
              },
            ]}
          >
            <Pressable
              style={styles.fabSmall}
              onPress={() => {
                action.onPress();
                toggleMenu();
              }}
            >
              {action.icon}
            </Pressable>
          </Animated.View>
        );
      })}

      {/* Main FAB */}
      <Pressable style={styles.fab} onPress={toggleMenu}>
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <Ionicons name="add" size={28} color="white" />
        </Animated.View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    alignItems: 'center',
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  fabSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  action: {
    position: 'absolute',
  },
});
