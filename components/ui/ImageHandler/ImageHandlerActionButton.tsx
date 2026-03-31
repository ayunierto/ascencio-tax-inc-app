import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Button, ButtonIcon } from '../Button';
import { useImageHandler } from './ImageHandlerContext';

type ActionType = 'camera' | 'gallery' | 'delete';

interface ImageHandlerActionButtonProps {
  action: ActionType;
  iconName?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  hideWhenUnavailable?: boolean;
  onPress?: () => void | Promise<void>;
  buttonProps?: Omit<
    React.ComponentProps<typeof Button>,
    'children' | 'onPress'
  >;
}

const getDefaultIcon = (action: ActionType): keyof typeof Ionicons.glyphMap => {
  if (action === 'camera') return 'camera-outline';
  if (action === 'gallery') return 'images-outline';
  return 'trash-outline';
};

export const ImageHandlerActionButton: React.FC<
  ImageHandlerActionButtonProps
> = ({
  action,
  iconName,
  disabled,
  hideWhenUnavailable = true,
  onPress,
  buttonProps,
}) => {
  const {
    uploading,
    allowCamera,
    allowGallery,
    hasImage,
    selectFromCamera,
    selectFromGallery,
    deleteImage,
  } = useImageHandler();

  const isAvailable =
    action === 'camera'
      ? allowCamera
      : action === 'gallery'
        ? allowGallery
        : hasImage;

  if (!isAvailable && hideWhenUnavailable) {
    return null;
  }

  const handlePress = async () => {
    if (onPress) {
      await onPress();
      return;
    }

    if (action === 'camera') {
      await selectFromCamera();
      return;
    }

    if (action === 'gallery') {
      await selectFromGallery();
      return;
    }

    await deleteImage();
  };

  return (
    <Button
      size="icon"
      onPress={handlePress}
      disabled={uploading || disabled || !isAvailable}
      {...buttonProps}
    >
      <ButtonIcon name={iconName || getDefaultIcon(action)} />
    </Button>
  );
};
