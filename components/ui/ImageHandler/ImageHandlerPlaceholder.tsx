import React from 'react';
import { View, ViewProps } from 'react-native';
import { useImageHandler } from './ImageHandlerContext';

interface ImageHandlerPlaceholderProps extends ViewProps {
  forceVisible?: boolean;
}

export const ImageHandlerPlaceholder: React.FC<
  ImageHandlerPlaceholderProps
> = ({ forceVisible = false, children, ...props }) => {
  const { hasImage } = useImageHandler();

  if (hasImage && !forceVisible) {
    return null;
  }

  return <View {...props}>{children}</View>;
};
