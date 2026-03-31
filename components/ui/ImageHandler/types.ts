import { ReactNode } from 'react';

export type ImageSource = 'camera' | 'gallery';

export interface ImageHandlerRef {
  markAsSaved: () => void;
}

export interface UploadResult {
  secureUrl: string;
  publicId: string;
}

export interface ImageHandlerCallbacks {
  onPermissionDenied?: (source: ImageSource) => void;
  onUploadSuccess?: (result: UploadResult) => void;
  onUploadError?: (error: unknown) => void;
  onDeleteSuccess?: () => void;
  onDeleteError?: (error: unknown) => void;
  onReplaceTempDeleteError?: (error: unknown) => void;
  onCleanupError?: (error: unknown) => void;
}

export interface ImageHandlerProps extends ImageHandlerCallbacks {
  value?: string;
  onChange: (imageUrl: string | undefined) => void;
  folder?: string;
  allowCamera?: boolean;
  allowGallery?: boolean;
  children: ReactNode;
}

export interface ImageHandlerContextValue {
  value?: string;
  localImageUrl?: string;
  uploading: boolean;
  imageLoadError: boolean;
  isViewerVisible: boolean;
  allowCamera: boolean;
  allowGallery: boolean;
  hasImage: boolean;
  selectFromCamera: () => Promise<void>;
  selectFromGallery: () => Promise<void>;
  deleteImage: () => Promise<void>;
  openViewer: () => void;
  closeViewer: () => void;
  setImageLoadError: (value: boolean) => void;
  markAsSaved: () => void;
}
