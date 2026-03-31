import React from 'react';
import { Image } from 'react-native';
import { theme } from './ui/theme';

const SimpleLogo = () => {
  return (
    <Image
      source={require('../assets/images/splash-icon.png')}
      style={{
        // maxWidth: 300,
        resizeMode: 'contain',
        height: 100,
        width: 100,
        borderWidth: 1,
        borderColor: theme.foreground,
        borderRadius: 999,
      }}
    />
  );
};

export default SimpleLogo;
