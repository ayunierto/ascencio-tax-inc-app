import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import {
  ImageHandlerCallbacks,
  ImageHandlerContextValue,
  ImageHandlerProps,
  ImageSource,
} from './types';
import { cloudinaryStorageProvider } from './cloudinaryStorage';

const RECEIPT_FOLDER_REGEX = /(^|\/)temp_receipts(\/|$)/;

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

const prepareReceiptImageForOcr = async (uri: string): Promise<string> => {
  const { uri: preparedUri } = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1280 } }],
    { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG },
  );

  return preparedUri;
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
    cloudinaryStorageProvider.resolveUrl(value),
  );

  const tempImageRef = useRef<string | undefined>(undefined);
  const savedRef = useRef<boolean>(false);
  const onCleanupErrorRef = useRef(onCleanupError);

  const isReceiptFolder = RECEIPT_FOLDER_REGEX.test(folder);

  useEffect(() => {
    onCleanupErrorRef.current = onCleanupError;
  }, [onCleanupError]);

  useEffect(() => {
    setLocalImageUrl(cloudinaryStorageProvider.resolveUrl(value));
    if (value && !cloudinaryStorageProvider.isRemoteUrl(value)) {
      tempImageRef.current = value;
    }
  }, [value]);

  useEffect(() => {
    return () => {
      const currentTemp = tempImageRef.current;

      if (
        currentTemp &&
        !savedRef.current &&
        cloudinaryStorageProvider.isTemporaryRef(currentTemp)
      ) {
        cloudinaryStorageProvider.delete(currentTemp).then((wasDeleted) => {
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
          const oldDeleted = await cloudinaryStorageProvider.delete(
            tempImageRef.current,
          );
          if (!oldDeleted) {
            onReplaceTempDeleteError?.({
              message: 'Failed to delete previous temporary image',
            });
          }
        }

        const uriToUpload = isReceiptFolder
          ? await prepareReceiptImageForOcr(selectedUri)
          : selectedUri;

        const uploadResult = await cloudinaryStorageProvider.uploadTemp(
          uriToUpload,
          folder,
        );

        if (!uploadResult) {
          onUploadError?.({
            message: 'Cloudinary upload did not return a result',
          });
          return;
        }

        tempImageRef.current = uploadResult.publicId;
        // For receipts we keep the secure URL to avoid rebuilding the URL later
        // and to match the header scan flow.
        onChange(
          isReceiptFolder ? uploadResult.secureUrl : uploadResult.publicId,
        );
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
      isReceiptFolder,
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

    const deleted = await cloudinaryStorageProvider.delete(imageToDelete);

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
