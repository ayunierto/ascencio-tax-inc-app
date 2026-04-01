import { ServerException } from '@/core/interfaces/server-exception.response';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { AnalyzedExpense } from '../interfaces/analyze-expense.interface';
import { ReceiptImage } from '../interfaces/upload-receipt-image.response';
import {
  analyzeReceiptFromImage,
  commitReceiptImageReference,
  rollbackTempReceiptImage,
  uploadTempReceiptImage,
} from '../services/receipt-image-lifecycle.service';

export const useReceiptPipeline = () => {
  const uploadImageMutation = useMutation<ReceiptImage, Error, string>({
    mutationFn: uploadTempReceiptImage,
    onError(error) {
      console.error(error.message);
    },
  });

  const getReceiptValuesMutation = useMutation<
    AnalyzedExpense,
    AxiosError<ServerException>,
    string
  >({
    mutationFn: analyzeReceiptFromImage,
    onError(error) {
      console.error(error);
    },
  });

  const removeReceiptImageMutation = useMutation<void, Error, string>({
    mutationFn: rollbackTempReceiptImage,
    onError(error) {
      console.error(error.message);
    },
  });

  return {
    uploadImageMutation,
    getReceiptValuesMutation,
    removeReceiptImageMutation,
    commitReceiptImageReference,
  };
};
