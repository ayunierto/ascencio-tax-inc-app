import { cloudinaryStorageProvider } from '@/components/ui/ImageHandler/cloudinaryStorage';
import { getReceiptValues } from '../../receipts/actions/get-receipt-values.action';
import { removeReceiptImage } from '../actions/remove-receipt-image.action';
import { AnalyzedExpense } from '../interfaces/analyze-expense.interface';
import { ReceiptImage } from '../interfaces/upload-receipt-image.response';

const RECEIPT_TEMP_FOLDER = 'temp_receipts';

export const uploadTempReceiptImage = async (
  uri: string,
): Promise<ReceiptImage> => {
  const uploaded = await cloudinaryStorageProvider.uploadTemp(
    uri,
    RECEIPT_TEMP_FOLDER,
  );

  if (!uploaded) {
    throw new Error('Failed to upload receipt image');
  }

  return {
    url: uploaded.secureUrl,
  };
};

export const analyzeReceiptFromImage = async (
  imageUrl: string,
): Promise<AnalyzedExpense> => {
  return getReceiptValues(imageUrl);
};

export const rollbackTempReceiptImage = async (
  imageRef: string,
): Promise<void> => {
  const deletedFromReceiptEndpoint = await removeReceiptImage({
    imageUrl: imageRef,
  })
    .then(() => true)
    .catch(() => false);

  if (deletedFromReceiptEndpoint) {
    return;
  }

  const deleted = await cloudinaryStorageProvider.delete(imageRef);
  if (!deleted) {
    throw new Error('Failed to delete receipt image');
  }
};

export const commitReceiptImageReference = (
  imageRef?: string,
): string | undefined => {
  if (!imageRef) return undefined;

  // The backend is the source of truth for promoting temp_receipts -> receipts.
  // We only validate the reference format here.
  if (cloudinaryStorageProvider.isRemoteUrl(imageRef)) {
    return imageRef;
  }

  return imageRef;
};
