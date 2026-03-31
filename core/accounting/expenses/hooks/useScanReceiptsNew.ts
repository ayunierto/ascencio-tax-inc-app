import { useRef, useState, useEffect } from 'react';

import { CameraView } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { toast } from 'sonner-native';
import { useTranslation } from 'react-i18next';
import { useExpenseStore } from '../store/useExpenseStore';
import { useReceiptImageMutation } from './useReceiptImageMutation';

export const useScanReceiptsNew = (
  expenseId?: string,
  preselectedImageUri?: string,
) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const ref = useRef<CameraView>(null);
  const [pictureUri, setPictureUri] = useState<string | null>(null);
  const { setDetails } = useExpenseStore();
  const { uploadImageMutation, getReceiptValuesMutation } =
    useReceiptImageMutation();

  // Handle pre-selected image from gallery
  useEffect(() => {
    if (preselectedImageUri) {
      handlePreselectedImage(preselectedImageUri);
    }
  }, [preselectedImageUri]);

  const handlePreselectedImage = async (uri: string) => {
    setLoading(true);
    setStatusMessage(t('compressingPicture'));
    const compressedUri = await compressPicture(uri);
    setPictureUri(compressedUri);
    setLoading(false);
  };

  const takePicture = async () => {
    try {
      const photo = await ref.current?.takePictureAsync();
      if (photo?.uri) {
        setLoading(true);
        setStatusMessage(t('compressingPicture'));
        const compressedUri = await compressPicture(photo?.uri);
        setPictureUri(compressedUri);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      toast.error(t('unknownError'));
      setLoading(false);
    }
  };

  const pickFromGallery = async () => {
    try {
      setLoading(true);

      const selectedPicture = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
      });

      if (selectedPicture.canceled) {
        setLoading(false);
        return;
      }

      setStatusMessage(t('compressingPicture'));
      const compressedPicture = await compressPicture(
        selectedPicture.assets[0].uri,
      );

      setPictureUri(compressedPicture);
      setLoading(false);
    } catch (error) {
      console.error('Error picking from gallery:', error);
      toast.error(t('unknownError'));
      setLoading(false);
    }
  };

  const confirmPicture = async () => {
    if (!pictureUri) return;

    try {
      setLoading(true);
      setStatusMessage(t('processingReceiptImage'));

      // 1. Upload picture
      setStatusMessage(t('uploadingImage'));
      const uploadedPicture = await uploadPicture(pictureUri);
      setDetails({
        imageUrl: uploadedPicture.url,
      });

      // 2. Extract receipt values (OCR + GPT)
      setStatusMessage(t('extractingReceiptValues'));
      const extractedValues = await getReceiptValues(uploadedPicture.url);
      setDetails({ ...extractedValues });

      // 3. Redirect to new or edit expense screen
      setPictureUri(null);
      if (expenseId && expenseId !== 'new') {
        router.replace({
          pathname: '/(app)/expenses/[id]',
          params: { id: expenseId },
        });
      } else {
        router.replace('/(app)/expenses/create');
      }
    } catch (error) {
      console.error('Error confirming picture:', error);
      toast.error(
        (error instanceof Error && error.message) || t('unknownError'),
      );
    } finally {
      setLoading(false);
      setStatusMessage('');
      setPictureUri(null);
    }
  };

  // Helpers
  const compressPicture = async (uri: string): Promise<string> => {
    const { uri: compressedUri } = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1280 } }],
      { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG },
    );
    return compressedUri;
  };

  const uploadPicture = async (uri: string) => {
    return await uploadImageMutation.mutateAsync(uri, {
      onSuccess: async () => {
        toast.success(t('imageUploaded'));
      },
      onError: (error) => {
        toast.error(t('errorUploadingImage'), {
          description: error.response?.data.message || error.message,
        });
      },
    });
  };

  const getReceiptValues = async (imageUrl: string) => {
    return await getReceiptValuesMutation.mutateAsync(imageUrl, {
      onError: (error) => {
        toast.error(t('errorGettingReceiptValues'), {
          description: error.response?.data.message || error.message,
        });
      },
    });
  };

  const retakePicture = () => {
    setPictureUri(null);
  };

  const dismissReceiptScanner = () => {
    setPictureUri(null);
    router.back();
  };

  return {
    loading,
    cameraRef: ref,
    takePicture,
    pictureUri,
    confirmPicture,
    retakePicture,
    dismissReceiptScanner,
    pickFromGallery,
    statusMessage,
  };
};
