import React, { ForwardedRef, forwardRef, useImperativeHandle } from 'react';
import { View, ViewProps } from 'react-native';
import { ImageHandlerContext } from './ImageHandlerContext';
import { useImageHandlerController } from './useImageHandlerController';
import { ImageHandlerProps, ImageHandlerRef } from './types';

interface ImageHandlerRootProps
  extends ImageHandlerProps, Omit<ViewProps, 'children'> {}

const ImageHandlerRootBase = (
  {
    value,
    onChange,
    folder,
    allowCamera,
    allowGallery,
    onPermissionDenied,
    onUploadSuccess,
    onUploadError,
    onDeleteSuccess,
    onDeleteError,
    onReplaceTempDeleteError,
    onCleanupError,
    children,
    ...viewProps
  }: ImageHandlerRootProps,
  ref: ForwardedRef<ImageHandlerRef>,
) => {
  const contextValue = useImageHandlerController({
    value,
    onChange,
    folder,
    allowCamera,
    allowGallery,
    onPermissionDenied,
    onUploadSuccess,
    onUploadError,
    onDeleteSuccess,
    onDeleteError,
    onReplaceTempDeleteError,
    onCleanupError,
  });

  useImperativeHandle(ref, () => ({
    markAsSaved: contextValue.markAsSaved,
  }));

  return (
    <ImageHandlerContext.Provider value={contextValue}>
      <View {...viewProps}>{children}</View>
    </ImageHandlerContext.Provider>
  );
};

export const ImageHandlerRoot = forwardRef<
  ImageHandlerRef,
  ImageHandlerRootProps
>(ImageHandlerRootBase);

ImageHandlerRoot.displayName = 'ImageHandlerRoot';
