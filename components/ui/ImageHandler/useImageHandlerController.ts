import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { UploadSignaturePayload } from '@ascencio/shared';
import { api } from '@/core/api/api';
import {
  ImageHandlerCallbacks,
  ImageHandlerContextValue,
  ImageHandlerProps,
  ImageSource,
  UploadResult,
} from './types';

const CLOUDINARY_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;

const isUrl = (value?: string): boolean => !!value && value.startsWith('http');

const resolveCloudinaryUrl = (value?: string): string | undefined => {
  if (!value) return undefined;
  if (isUrl(value)) return value;
  if (!CLOUDINARY_CLOUD_NAME) return undefined;
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${value}`;
};

const extractPublicId = (url: string): string | null => {
  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;

    const pathParts = parts[1].split('/');
    const relevantParts = pathParts.filter((part) => !part.startsWith('v'));

    const filenameWithExt = relevantParts[relevantParts.length - 1];
    const filename = filenameWithExt.split('.')[0];
    const folderPath = relevantParts.slice(0, -1).join('/');

    return folderPath ? `${folderPath}/${filename}` : filename;
  } catch (error) {
    console.error('Error extracting cloudinary publicId:', error);
    return null;
  }
};

const deleteImageFromCloudinary = async (
  imageRef: string,
): Promise<boolean> => {
  const publicId = isUrl(imageRef) ? extractPublicId(imageRef) : imageRef;

  if (!publicId) {
    return false;
  }

  try {
    await api.delete(`/files/${encodeURIComponent(publicId)}`);
    return true;
  } catch (error) {
    console.error('Error deleting image from cloudinary:', error);
    return false;
  }
};

const requestSignature = async (
  folder: string,
): Promise<UploadSignaturePayload> => {
  const { data } = await api.post<UploadSignaturePayload>('/files/signature', {
    folder,
  });
  return data;
};

const uploadImage = async (
  uri: string,
  folder: string,
): Promise<UploadResult | undefined> => {
  try {
    const signed = await requestSignature(folder);
    const formData = new FormData();
    const uriParts = uri.split('.');
    const fileType = uriParts[uriParts.length - 1] || 'jpg';

    formData.append('file', {
      uri,
      name: `photo.${fileType}`,
      type: `image/${fileType}`,
    } as unknown as Blob);

    formData.append('api_key', signed.apiKey);
    formData.append('timestamp', String(signed.timestamp));
    formData.append('signature', signed.signature);
    formData.append('public_id', signed.publicId);
    formData.append('folder', signed.folder);

    const response = await fetch(signed.uploadUrl, {
      method: 'POST',
      body: formData,
    });

    const json = await response.json();

    if (!response.ok) {
      console.error('Cloudinary upload failed:', json?.error?.message);
      return undefined;
    }

    return {
      secureUrl: json.secure_url as string,
      publicId: json.public_id as string,
    };
  } catch (error) {
    console.error('Unexpected error uploading image:', error);
    return undefined;
  }
};

const requestPermission = async (source: ImageSource): Promise<boolean> => {
  const permissionResult =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

  return permissionResult.granted;
};

const pickImage = async (source: ImageSource): Promise<string | undefined> => {
  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 0.8,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 0.8,
        });

  if (result.canceled) {
    return undefined;
  }

  return result.assets[0]?.uri;
};

interface UseImageHandlerControllerArgs
  extends Omit<ImageHandlerProps, 'children'>, ImageHandlerCallbacks {}

export const useImageHandlerController = ({
  value,
  onChange,
  folder = 'temp_files',
  allowCamera = true,
  allowGallery = true,
  onPermissionDenied,
  onUploadSuccess,
  onUploadError,
  onDeleteSuccess,
  onDeleteError,
  onReplaceTempDeleteError,
  onCleanupError,
}: UseImageHandlerControllerArgs): ImageHandlerContextValue => {
  const [uploading, setUploading] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [localImageUrl, setLocalImageUrl] = useState<string | undefined>(
    resolveCloudinaryUrl(value),
  );

  const tempImageRef = useRef<string | undefined>(undefined);
  const savedRef = useRef<boolean>(false);
  const onCleanupErrorRef = useRef(onCleanupError);

  useEffect(() => {
    onCleanupErrorRef.current = onCleanupError;
  }, [onCleanupError]);

  useEffect(() => {
    setLocalImageUrl(resolveCloudinaryUrl(value));
    if (value && !isUrl(value)) {
      tempImageRef.current = value;
    }
  }, [value]);

  useEffect(() => {
    return () => {
      const currentTemp = tempImageRef.current;

      if (
        currentTemp &&
        !savedRef.current &&
        currentTemp.startsWith('temp_files/')
      ) {
        deleteImageFromCloudinary(currentTemp).then((wasDeleted) => {
          if (!wasDeleted) {
            onCleanupErrorRef.current?.({
              message: 'Failed to cleanup temporary image',
            });
          }
        });
      }
    };
  }, []);

  const handleSelectImage = useCallback(
    async (source: ImageSource) => {
      setUploading(true);

      try {
        const isGranted = await requestPermission(source);

        if (!isGranted) {
          onPermissionDenied?.(source);
          return;
        }

        const selectedUri = await pickImage(source);

        if (!selectedUri) {
          return;
        }

        if (tempImageRef.current) {
          const oldDeleted = await deleteImageFromCloudinary(
            tempImageRef.current,
          );
          if (!oldDeleted) {
            onReplaceTempDeleteError?.({
              message: 'Failed to delete previous temporary image',
            });
          }
        }

        const uploadResult = await uploadImage(selectedUri, folder);

        if (!uploadResult) {
          onUploadError?.({
            message: 'Cloudinary upload did not return a result',
          });
          return;
        }

        tempImageRef.current = uploadResult.publicId;
        onChange(uploadResult.publicId);
        setLocalImageUrl(uploadResult.secureUrl);
        setImageLoadError(false);
        onUploadSuccess?.(uploadResult);
      } catch (error) {
        onUploadError?.(error);
      } finally {
        setUploading(false);
      }
    },
    [
      folder,
      onChange,
      onPermissionDenied,
      onReplaceTempDeleteError,
      onUploadError,
      onUploadSuccess,
    ],
  );

  const handleDeleteImage = useCallback(async () => {
    if (!value && !tempImageRef.current) return;

    const imageToDelete = tempImageRef.current || value;
    if (!imageToDelete) return;

    const previousLocalImageUrl = localImageUrl;
    setLocalImageUrl(undefined);
    onChange(undefined);
    tempImageRef.current = undefined;

    const deleted = await deleteImageFromCloudinary(imageToDelete);

    if (deleted) {
      onDeleteSuccess?.();
      return;
    }

    setLocalImageUrl(previousLocalImageUrl);
    onChange(value);
    onDeleteError?.({ message: 'Failed to delete image from cloudinary' });
  }, [localImageUrl, onChange, onDeleteError, onDeleteSuccess, value]);

  const markAsSaved = useCallback(() => {
    savedRef.current = true;
  }, []);

  const contextValue = useMemo<ImageHandlerContextValue>(
    () => ({
      value,
      localImageUrl,
      uploading,
      imageLoadError,
      isViewerVisible,
      allowCamera,
      allowGallery,
      hasImage: !!localImageUrl && !imageLoadError,
      selectFromCamera: () => handleSelectImage('camera'),
      selectFromGallery: () => handleSelectImage('gallery'),
      deleteImage: handleDeleteImage,
      openViewer: () => setIsViewerVisible(true),
      closeViewer: () => setIsViewerVisible(false),
      setImageLoadError,
      markAsSaved,
    }),
    [
      value,
      localImageUrl,
      uploading,
      imageLoadError,
      isViewerVisible,
      allowCamera,
      allowGallery,
      handleSelectImage,
      handleDeleteImage,
      markAsSaved,
    ],
  );

  return contextValue;
};
