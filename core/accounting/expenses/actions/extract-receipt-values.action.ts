// TODO: Pending review.
import { api } from '@/core/api/api';
import { AnalyzedExpense } from '../interfaces';

// TODO: Implement uploading the image to the server first and send the image URL to the analyze endpoint.
// TODO: Change this logic once the backend is ready to accept image URLs.
export const extractReceiptValues = async (
  base64Image: string
): Promise<AnalyzedExpense> => {
  const { data } = await api.post<AnalyzedExpense>('expense/analyze-expense', {
    base64Image,
  });
  return data;
};
