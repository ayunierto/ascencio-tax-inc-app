import { api } from '@/core/api/api';
import { ReceiptImage } from '../interfaces/upload-receipt-image.response';

export const uploadReceiptImage = async (
  uri: string,
): Promise<ReceiptImage> => {
  const formdata = new FormData() as any;
  formdata.append('file', {
    uri: uri,
    name: 'receipt.jpg',
    type: 'image/jpeg',
  });

  const { data } = await api.post<ReceiptImage>(
    '/expenses/upload-receipt-image',
    formdata,
  );

  return data;
};
