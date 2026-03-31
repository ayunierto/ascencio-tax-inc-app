import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface RetakeImageButtonProps {
  onPress: () => void;
}

export const RetakeImageButton = ({ onPress }: RetakeImageButtonProps) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.flipCameraButton}>
      <Ionicons name="close-outline" size={30} color={'white'} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  flipCameraButton: {
    width: 50,
    height: 50,
    borderRadius: 32,
    backgroundColor: '#17202A',
    position: 'absolute',
    bottom: 40,
    right: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
