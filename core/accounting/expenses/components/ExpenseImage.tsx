import React, { useState, useEffect, useRef } from 'react';
import {
  Image,
  StyleSheet,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner-native';
import { Ionicons } from '@expo/vector-icons';

import { Button, ButtonIcon } from '@/components/ui/Button';
import { ThemedText } from '@/components/ui/ThemedText';
import { theme } from '@/components/ui/theme';
import { SinglePhotoViewer } from '@/core/components/SinglePhotoViewer';
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
} from '@/components/ui/AlertDialog';
import { useReceiptImageMutation } from '../hooks/useReceiptImageMutation';

type ExpenseImageProps = {
  imageUrl?: string;
  onChange: (image: string | undefined) => void;
  expenseId: string;
};

const CLOUDINARY_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;

const isUrl = (value?: string) => !!value && value.startsWith('http');

const resolveCloudinaryUrl = (value?: string): string | undefined => {
  if (!value) return undefined;
  if (isUrl(value)) return value;
  if (!CLOUDINARY_CLOUD_NAME) return undefined;
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${value}`;
};

const ExpenseImage = ({ imageUrl, onChange, expenseId }: ExpenseImageProps) => {
  const { t } = useTranslation();
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [localImageUrl, setLocalImageUrl] = useState<string | undefined>(
    resolveCloudinaryUrl(imageUrl),
  );

  const { removeReceiptImageMutation } = useReceiptImageMutation();
  const tempImageRef = useRef<string | undefined>(undefined);

  // Sync local state with imageUrl prop
  useEffect(() => {
    setLocalImageUrl(resolveCloudinaryUrl(imageUrl));
    if (imageUrl && !isUrl(imageUrl)) {
      tempImageRef.current = imageUrl;
    }
  }, [imageUrl]);

  const openViewer = () => setIsViewerVisible(true);
  const closeViewer = () => setIsViewerVisible(false);

  /**
   * Navigate to scan screen with OCR functionality
   */
  const handleScanReceipt = () => {
    router.push({
      pathname: '/(app)/expenses/scan',
      params: { id: expenseId },
    });
  };

  /**
   * Handle gallery selection for receipts
   */
  const handleSelectFromGallery = async () => {
    try {
      setUploading(true);

      // Request permissions
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        toast.error(t('permissionRequired'), {
          description: t('galleryPermissionMessage'),
        });
        setUploading(false);
        return;
      }

      // Launch picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled) {
        setUploading(false);
        return;
      }

      // Navigate to scan screen with selected image
      // The scan screen will handle OCR processing
      router.push({
        pathname: '/(app)/expenses/scan',
        params: {
          id: expenseId,
          selectedImageUri: result.assets[0].uri,
        },
      });
    } catch (error) {
      console.error('Error selecting image:', error);
      toast.error(t('errorUploadingImage'));
    } finally {
      setUploading(false);
    }
  };

  /**
   * Handle image deletion with cleanup
   */
  const handleRemoveImage = async () => {
    if (!imageUrl) return;

    try {
      setUploading(true);
      await removeReceiptImageMutation.mutateAsync(
        { imageUrl },
        {
          onSuccess: () => {
            toast.success(t('imageRemoved'));
            onChange(undefined);
            setLocalImageUrl(undefined);
            tempImageRef.current = undefined;
          },
          onError: (error) => {
            console.error(error);
            toast.error(t('imageRemovalFailed'), {
              description: error.response?.data.message || error.message,
            });
          },
        },
      );
    } finally {
      setUploading(false);
    }
  };

  /**
   * Cleanup temp image on unmount if not saved
   */
  useEffect(() => {
    return () => {
      const currentTemp = tempImageRef.current;
      if (currentTemp && currentTemp.startsWith('temp_files/')) {
        removeReceiptImageMutation.mutate({ imageUrl: currentTemp });
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>{t('scanReceipt')}</ThemedText>

      <View style={styles.imageContainer}>
        {localImageUrl && !imageLoadError ? (
          <View style={styles.imageWrapper}>
            <TouchableOpacity onPress={openViewer} style={{ flex: 1 }}>
              <Image
                source={{ uri: localImageUrl }}
                style={styles.image}
                onError={() => setImageLoadError(true)}
                resizeMode="cover"
              />
            </TouchableOpacity>

            <SinglePhotoViewer
              imageUrl={localImageUrl}
              isVisible={isViewerVisible}
              onClose={closeViewer}
            />

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  style={styles.deleteButton}
                  variant="destructive"
                  disabled={uploading || !imageUrl}
                  size="icon"
                >
                  <ButtonIcon name="trash-outline" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('areYouSure')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('thisActionCannotBeUndone')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                  <AlertDialogAction onPress={handleRemoveImage}>
                    {t('delete')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {uploading && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="large" color={theme.primary} />
              </View>
            )}
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Ionicons
              name="receipt-outline"
              size={50}
              color={theme.mutedForeground}
            />
            <ThemedText style={styles.placeholderText}>
              {imageLoadError
                ? t('imageLoadError')
                : t('noReceiptImageSelected')}
            </ThemedText>
          </View>
        )}

        <View style={styles.buttonsContainer}>
          <Button size="icon" onPress={handleScanReceipt} disabled={uploading}>
            <ButtonIcon name="camera-outline" />
          </Button>

          <Button
            size="icon"
            onPress={handleSelectFromGallery}
            disabled={uploading}
          >
            <ButtonIcon name="images-outline" />
          </Button>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
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
  image: {
    width: '100%',
    height: '100%',
  },
  deleteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
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

export default ExpenseImage;
