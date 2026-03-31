import { ImageHandlerRoot } from './ImageHandler';
import { useImageHandler } from './ImageHandlerContext';
import { ImageHandlerActionButton } from './ImageHandlerActionButton';
import { ImageHandlerActions } from './ImageHandlerActions';
import { ImageHandlerImage } from './ImageHandlerImage';
import { ImageHandlerPlaceholder } from './ImageHandlerPlaceholder';
import { ImageHandlerUploadingOverlay } from './ImageHandlerUploadingOverlay';
import { ImageHandlerViewer } from './ImageHandlerViewer';

export type {
  ImageHandlerCallbacks,
  ImageHandlerContextValue,
  ImageHandlerProps,
  ImageHandlerRef,
  ImageSource,
  UploadResult,
} from './types';

export const ImageHandler = Object.assign(ImageHandlerRoot, {
  Image: ImageHandlerImage,
  Placeholder: ImageHandlerPlaceholder,
  Actions: ImageHandlerActions,
  ActionButton: ImageHandlerActionButton,
  UploadingOverlay: ImageHandlerUploadingOverlay,
  Viewer: ImageHandlerViewer,
});

export { useImageHandler };
