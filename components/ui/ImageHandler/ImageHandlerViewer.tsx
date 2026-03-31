import React from 'react';
import { SinglePhotoViewer } from '@/core/components/SinglePhotoViewer';
import { useImageHandler } from './ImageHandlerContext';

interface ImageHandlerViewerProps {
  imageUrl?: string;
}

export const ImageHandlerViewer: React.FC<ImageHandlerViewerProps> = ({
  imageUrl,
}) => {
  const { localImageUrl, isViewerVisible, closeViewer } = useImageHandler();
  const finalUrl = imageUrl || localImageUrl;

  if (!finalUrl) {
    return null;
  }

  return (
    <SinglePhotoViewer
      imageUrl={finalUrl}
      isVisible={isViewerVisible}
      onClose={closeViewer}
    />
  );
};
