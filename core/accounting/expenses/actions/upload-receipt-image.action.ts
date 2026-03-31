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

  // const { data } = await api.post<ReceiptImage>(
  //   '/expenses/upload-receipt-image',
  //   formdata
  // );

  const response = await fetch(
    `${process.env.EXPO_PUBLIC_API_URL}/expenses/upload-receipt-image`,
    {
      method: 'POST',
      body: formdata,
      headers: {
        Authorization: `Bearer ${await SecureStore.getItemAsync(
          'access_token',
        )}`,
      },
    },
  );
  const data = await response.json();

  return data;
};
