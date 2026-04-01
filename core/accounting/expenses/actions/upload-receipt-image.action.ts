import { api } from '@/core/api/api';
import * as SecureStore from 'expo-secure-store';
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

  const accessToken = await SecureStore.getItemAsync('access_token');
  const baseUrl = api.defaults.baseURL || process.env.EXPO_PUBLIC_API_URL;

  if (!baseUrl) {
    throw new Error('API base URL is not configured');
  }

  const uploadUrl = `${baseUrl.replace(/\/$/, '')}/expenses/upload-receipt-image`;

  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formdata,
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      Accept: 'application/json',
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        `Failed to upload receipt image (HTTP ${response.status})`,
    );
  }

  return data;
};
