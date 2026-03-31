import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface ReturnCancelButtonProps {
  onPress: () => void;
}

export const ReturnCancelButton = ({ onPress }: ReturnCancelButtonProps) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.returnCancelButton}>
      <Ionicons name="arrow-back-outline" size={24} color={'white'} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  returnCancelButton: {
    width: 50,
    height: 50,
    borderRadius: 32,
    backgroundColor: '#17202A',
    position: 'absolute',
    top: 60,
    left: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
