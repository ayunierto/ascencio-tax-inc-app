import { UploadSignaturePayload } from '@ascencio/shared';
import { api } from '@/core/api/api';
import { getCloudinaryCloudName } from '@/core/config/store/useMobileConfigStore';
import { UploadResult } from './types';
import { ImageStorageProvider } from './storage-provider';

const TEMP_IMAGE_FOLDER_REGEX = /(^|\/)temp_(files|receipts)(\/|$)/;

export const isRemoteUrl = (value?: string): boolean =>
  !!value && value.startsWith('http');

export const resolveStoredImageUrl = (value?: string): string | undefined => {
  if (!value) return undefined;
  if (isRemoteUrl(value)) return value;

  const cloudinaryCloudName = getCloudinaryCloudName();
  if (!cloudinaryCloudName) return undefined;

  return `https://res.cloudinary.com/${cloudinaryCloudName}/image/upload/${value}`;
};

export const extractPublicIdFromCloudinaryUrl = (
  url: string,
): string | null => {
  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;

    const pathParts = parts[1].split('/');
    const relevantParts = pathParts.filter((part) => !part.startsWith('v'));

    const filenameWithExt = relevantParts[relevantParts.length - 1];
    const filename = filenameWithExt.split('.')[0];
    const folderPath = relevantParts.slice(0, -1).join('/');

    return folderPath ? `${folderPath}/${filename}` : filename;
  } catch (error) {
    console.error('Error extracting cloudinary publicId:', error);
    return null;
  }
};

export const toCloudinaryPublicId = (imageRef: string): string | null =>
  isRemoteUrl(imageRef)
    ? extractPublicIdFromCloudinaryUrl(imageRef)
    : imageRef || null;

export const isTemporaryCloudinaryPublicId = (publicId?: string): boolean =>
  !!publicId && TEMP_IMAGE_FOLDER_REGEX.test(publicId);

export const isTemporaryImageRef = (imageRef?: string): boolean => {
  if (!imageRef) return false;
  const publicId = toCloudinaryPublicId(imageRef);
  return isTemporaryCloudinaryPublicId(publicId || undefined);
};

const requestSignature = async (
  folder: string,
): Promise<UploadSignaturePayload> => {
  const { data } = await api.post<UploadSignaturePayload>('/files/signature', {
    folder,
  });
  return data;
};

export const uploadImageToCloudinary = async (
  uri: string,
  folder: string,
): Promise<UploadResult | undefined> => {
  try {
    const signed = await requestSignature(folder);
    const formData = new FormData();
    const uriParts = uri.split('.');
    const fileType = uriParts[uriParts.length - 1] || 'jpg';

    formData.append('file', {
      uri,
      name: `photo.${fileType}`,
      type: `image/${fileType}`,
    } as unknown as Blob);

    formData.append('api_key', signed.apiKey);
    formData.append('timestamp', String(signed.timestamp));
    formData.append('signature', signed.signature);
    formData.append('public_id', signed.publicId);
    formData.append('folder', signed.folder);

    const response = await fetch(signed.uploadUrl, {
      method: 'POST',
      body: formData,
    });

    const json = await response.json();

    if (!response.ok) {
      console.error('Cloudinary upload failed:', json?.error?.message);
      return undefined;
    }

    return {
      secureUrl: json.secure_url as string,
      publicId: json.public_id as string,
    };
  } catch (error) {
    console.error('Unexpected error uploading image:', error);
    return undefined;
  }
};

export const deleteImageFromCloudinary = async (
  imageRef: string,
): Promise<boolean> => {
  const publicId = toCloudinaryPublicId(imageRef);

  if (!publicId) {
    return false;
  }

  try {
    await api.delete(`/files/${encodeURIComponent(publicId)}`);
    return true;
  } catch (error) {
    console.error('Error deleting image from cloudinary:', error);
    return false;
  }
};

export const cloudinaryStorageProvider: ImageStorageProvider = {
  resolveUrl: resolveStoredImageUrl,
  isRemoteUrl,
  toPublicId: toCloudinaryPublicId,
  isTemporaryRef: isTemporaryImageRef,
  uploadTemp: uploadImageToCloudinary,
  delete: deleteImageFromCloudinary,
};
