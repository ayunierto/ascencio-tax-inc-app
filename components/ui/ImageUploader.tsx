import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner-native';
import { Ionicons } from '@expo/vector-icons';

import { Button, ButtonIcon } from './Button';
import { ThemedText } from './ThemedText';
import { theme } from './theme';
import {
  ImageHandler,
  ImageHandlerRef as CompoundImageHandlerRef,
  ImageSource,
  useImageHandler,
} from './ImageHandler';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './AlertDialog';

interface ImageUploaderProps {
  /**
   * Current image URL (Cloudinary URL)
   */
  value?: string;

  /**
   * Callback when image URL changes
   */
  onChange: (imageUrl: string | undefined) => void;

  /**
   * Cloudinary folder for upload (defaults to 'temp_files')
   */
  folder?: string;

  /**
   * Label to display when no image is selected
   */
  label?: string;

  /**
   * Allow camera capture
   */
  allowCamera?: boolean;

  /**
   * Allow gallery selection
   */
  allowGallery?: boolean;
}

/**
 * Ref handle for ImageUploader to mark image as saved
 */
export interface ImageUploaderRef {
  /**
   * Call this after the form is successfully saved to prevent
   * the cleanup effect from deleting the promoted image.
   */
  markAsSaved: () => void;
}

interface ImageUploaderAreaProps {
  noImageText: string;
  imageLoadErrorText: string;
  confirmTitle: string;
  confirmDescription: string;
  cancelText: string;
  deleteText: string;
}

const ImageUploaderArea: React.FC<ImageUploaderAreaProps> = ({
  noImageText,
  imageLoadErrorText,
  confirmTitle,
  confirmDescription,
  cancelText,
  deleteText,
}) => {
  const { hasImage, imageLoadError, uploading, deleteImage } =
    useImageHandler();

  if (!hasImage) {
    return (
      <ImageHandler.Placeholder style={styles.placeholderContainer}>
        <Ionicons
          name="image-outline"
          size={50}
          color={theme.mutedForeground}
        />
        <ThemedText style={styles.placeholderText}>
          {imageLoadError ? imageLoadErrorText : noImageText}
        </ThemedText>
      </ImageHandler.Placeholder>
    );
  }

  return (
    <View style={styles.imageWrapper}>
      <ImageHandler.Image
        containerStyle={styles.previewPressable}
        style={styles.image}
        resizeMode="cover"
      />

      <ImageHandler.Viewer />

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            style={styles.deleteButton}
            variant="destructive"
            disabled={uploading}
            size="icon"
          >
            <ButtonIcon name="trash-outline" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{cancelText}</AlertDialogCancel>
            <AlertDialogAction onPress={deleteImage}>
              {deleteText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ImageHandler.UploadingOverlay overlayStyle={styles.uploadingOverlay} />
    </View>
  );
};

/**
 * ImageUploader Component
 *
 * A controlled component for uploading images to Cloudinary with camera and gallery support.
 *
 * Features:
 * - Uploads to Cloudinary immediately on selection
 * - Stores images in temporary folder by default
 * - Auto-cleanup of temp images on unmount
 * - Camera and gallery support with permission handling
 * - Loading states and error handling
 * - Delete functionality
 *
 * Usage:
 * ```tsx
 * <Controller
 *   control={control}
 *   name="logoUrl"
 *   render={({ field: { onChange, value } }) => (
 *     <ImageUploader
 *       value={value}
 *       onChange={onChange}
 *       folder="temp_files"
 *       label={t('companyLogo')}
 *     />
 *   )}
 * />
 * ```
 *
 * Important: When saving the form, move images from temp to permanent folder:
 * ```ts
 * if (data.logoUrl?.includes('/temp_files/')) {
 *   await filesService.move(publicId, `companies/${filename}`);
 * }
 * ```
 */
export const ImageUploader = forwardRef<ImageUploaderRef, ImageUploaderProps>(
  (
    {
      value,
      onChange,
      folder = 'temp_files',
      label,
      allowCamera = true,
      allowGallery = true,
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const imageHandlerRef = useRef<CompoundImageHandlerRef>(null);

    useImperativeHandle(ref, () => ({
      markAsSaved: () => {
        imageHandlerRef.current?.markAsSaved();
      },
    }));

    const handlePermissionDenied = (source: ImageSource) => {
      Alert.alert(
        t('permissionRequired'),
        t(
          source === 'camera'
            ? 'cameraPermissionMessage'
            : 'galleryPermissionMessage',
        ),
      );
    };

    return (
      <ImageHandler
        ref={imageHandlerRef}
        value={value}
        onChange={onChange}
        folder={folder}
        allowCamera={allowCamera}
        allowGallery={allowGallery}
        onPermissionDenied={handlePermissionDenied}
        onUploadSuccess={() => toast.success(t('imageUploadedSuccessfully'))}
        onUploadError={(error) => {
          console.error('Error selecting/uploading image:', error);
          toast.error(t('imageUploadFailed'));
        }}
        onDeleteSuccess={() => toast.success(t('imageDeletedSuccessfully'))}
        onDeleteError={(error) => {
          console.error('Error deleting image:', error);
          toast.error(t('imageDeleteFailed'));
        }}
        onReplaceTempDeleteError={(error) => {
          console.error('Error deleting old temp image:', error);
        }}
        onCleanupError={(error) => {
          console.error('Error cleaning up temp image on unmount:', error);
        }}
        style={styles.container}
      >
        {label && <ThemedText style={styles.label}>{label}</ThemedText>}

        <View style={styles.imageContainer}>
          <ImageUploaderArea
            noImageText={t('noImageSelected')}
            imageLoadErrorText={t('imageLoadError')}
            confirmTitle={t('areYouSure')}
            confirmDescription={t('thisActionCannotBeUndone')}
            cancelText={t('cancel')}
            deleteText={t('delete')}
          />

          <ImageHandler.Actions style={styles.buttonsContainer}>
            {allowCamera && <ImageHandler.ActionButton action="camera" />}

            {allowGallery && <ImageHandler.ActionButton action="gallery" />}
          </ImageHandler.Actions>
        </View>
      </ImageHandler>
    );
  },
);

// Display name for debugging
ImageUploader.displayName = 'ImageUploader';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: theme.card,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  imageWrapper: {
    flex: 1,
    position: 'relative',
  },
  previewPressable: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    marginTop: 12,
    textAlign: 'center',
    color: theme.mutedForeground,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 4,
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    justifyContent: 'flex-end',
  },
});
