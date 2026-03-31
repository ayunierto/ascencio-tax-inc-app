import { createContext, useContext } from 'react';
import { ImageHandlerContextValue } from './types';

export const ImageHandlerContext =
  createContext<ImageHandlerContextValue | null>(null);

export const useImageHandler = (): ImageHandlerContextValue => {
  const context = useContext(ImageHandlerContext);

  if (!context) {
    console.error(
      'ImageHandler compound component was used outside ImageHandler root',
    );
    return {
      value: undefined,
      localImageUrl: undefined,
      uploading: false,
      imageLoadError: false,
      isViewerVisible: false,
      allowCamera: false,
      allowGallery: false,
      hasImage: false,
      selectFromCamera: async () => {},
      selectFromGallery: async () => {},
      deleteImage: async () => {},
      openViewer: () => {},
      closeViewer: () => {},
      setImageLoadError: () => {},
      markAsSaved: () => {},
    };
  }

  return context;
};
