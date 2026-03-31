import React from 'react';
import {
  ActivityIndicator,
  ActivityIndicatorProps,
  StyleProp,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';
import { theme } from '../theme';
import { useImageHandler } from './ImageHandlerContext';

interface ImageHandlerUploadingOverlayProps extends ViewProps {
  overlayStyle?: StyleProp<ViewStyle>;
  indicatorProps?: ActivityIndicatorProps;
}

export const ImageHandlerUploadingOverlay: React.FC<
  ImageHandlerUploadingOverlayProps
> = ({ overlayStyle, indicatorProps, ...props }) => {
  const { uploading } = useImageHandler();

  if (!uploading) {
    return null;
  }

  return (
    <View {...props} style={overlayStyle}>
      <ActivityIndicator
        size="large"
        color={theme.primary}
        {...indicatorProps}
      />
    </View>
  );
};
