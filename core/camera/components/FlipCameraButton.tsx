import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface FlipCameraButtonProps {
  onPress: () => void;
}

export const FlipCameraButton = ({ onPress }: FlipCameraButtonProps) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.flipCameraButton}>
      <Ionicons name="camera-reverse-outline" size={30} color={'white'} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  flipCameraButton: {
    width: 50,
    height: 50,
    borderRadius: 32,
    backgroundColor: '#17202A',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
