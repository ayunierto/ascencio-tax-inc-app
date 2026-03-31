// Import necessary components
import React from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  View,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ImageViewer from 'react-native-image-zoom-viewer';
import { IImageInfo } from 'react-native-image-zoom-viewer/built/image-viewer.type';

interface SinglePhotoViewerProps {
  imageUrl: string | undefined;
  isVisible: boolean;
  onClose: () => void;
}

// Define the component
export const SinglePhotoViewer = ({
  imageUrl,
  isVisible,
  onClose,
}: SinglePhotoViewerProps) => {
  // Prepare the image data structure required by ImageViewer
  // It expects an array of objects, even for a single image.
  const images: IImageInfo[] = imageUrl ? [{ url: imageUrl }] : [];

  if (!isVisible || !imageUrl) {
    return null; // Don't render anything if not visible or no URL
  }

  return (
    <Modal visible={isVisible} transparent={true} onRequestClose={onClose}>
      <ImageViewer
        imageUrls={images}
        enableSwipeDown={true} // Allows closing by swiping down
        onSwipeDown={onClose} // Call onClose when swiped down
        renderHeader={() => (
          // Custom header with close button matching app theme
          <View style={styles.header}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
        // Optional: Show a loading indicator while the image loads
        loadingRender={() => <ActivityIndicator size="large" color="#007AFF" />}
        // Optional: Customize the rendering for failed image loads
        failImageSource={{
          // Display a placeholder if the image fails to load
          url: 'https://placehold.co/300x300?text=Load+Error&font=source-sans-pro',
          width: 300,
          height: 300,
        }}
      />
    </Modal>
  );
};

// Basic styles (customize as needed)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    position: 'absolute',
    top: 50, // Adjust based on status bar height or safe area
    right: 20,
    zIndex: 1, // Ensure it's above the image viewer
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
