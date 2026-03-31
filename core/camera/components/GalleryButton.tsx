import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  StyleProp,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';

interface GalleryButtonProps extends TouchableOpacityProps {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export const GalleryButton = ({ onPress, style }: GalleryButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {
          width: 50,
          height: 50,
          borderRadius: 9999,
          backgroundColor: '#17202A',
          justifyContent: 'center',
          alignItems: 'center',
        },
        style,
      ]}
    >
      <Ionicons name="image-outline" size={30} color={'white'} />
    </TouchableOpacity>
  );
};
