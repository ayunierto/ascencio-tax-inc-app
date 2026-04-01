import { UploadResult } from './types';

export interface ImageStorageProvider {
  resolveUrl(value?: string): string | undefined;
  isRemoteUrl(value?: string): boolean;
  toPublicId(imageRef: string): string | null;
  isTemporaryRef(imageRef?: string): boolean;
  uploadTemp(uri: string, folder: string): Promise<UploadResult | undefined>;
  delete(imageRef: string): Promise<boolean>;
}
