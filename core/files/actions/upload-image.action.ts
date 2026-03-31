import { api } from '@/core/api/api';
import { ImagePickerAsset } from 'expo-image-picker';
import {
  UploadImageFile,
  UploadFileResponse,
} from '../interfaces/upload-image.interface';

export const uploadImage = async (
  image: ImagePickerAsset,
): Promise<UploadFileResponse> => {
  const formdata = new FormData() as any;
  formdata.append('file', {
    uri: image.uri,
    name: image.fileName || 'photo.jpg',
    type: 'image/jpeg',
  });

  const { data } = await api.post<UploadFileResponse>(
    'files/upload-image',
    formdata,
  );

  return data;
};
