import { api } from './api';
import { UploadSignaturePayload } from '@ascencio/shared';

export async function requestUploadSignature(folder = 'temp_files') {
  const { data } = await api.post<UploadSignaturePayload>('/files/signature', {
    folder,
  });
  return data;
}

export async function deleteTempMedia(token: string) {
  const { data } = await api.delete(`/files/${token}`);
  return data as { success: boolean };
}
