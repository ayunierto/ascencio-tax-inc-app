import React from 'react';
import {
  Image,
  ImageErrorEventData,
  ImageProps,
  NativeSyntheticEvent,
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useImageHandler } from './ImageHandlerContext';

interface ImageHandlerImageProps extends Omit<ImageProps, 'source'> {
  containerStyle?: StyleProp<ViewStyle>;
  pressableProps?: Omit<PressableProps, 'onPress'>;
  onPressImage?: () => void;
}

export const ImageHandlerImage: React.FC<ImageHandlerImageProps> = ({
  containerStyle,
  pressableProps,
  onPressImage,
  onError,
  ...imageProps
}) => {
  const { localImageUrl, openViewer, setImageLoadError, hasImage } =
    useImageHandler();

  const handleError = (event: NativeSyntheticEvent<ImageErrorEventData>) => {
    setImageLoadError(true);
    onError?.(event);
  };

  if (!hasImage || !localImageUrl) {
    return null;
  }

  return (
    <Pressable
      onPress={onPressImage || openViewer}
      style={containerStyle}
      {...pressableProps}
    >
      <Image
        {...imageProps}
        source={{ uri: localImageUrl }}
        onError={handleError}
      />
    </Pressable>
  );
};
