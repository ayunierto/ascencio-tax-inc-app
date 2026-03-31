import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import { Alert, Image, StyleSheet, View } from "react-native";

import Loader from "@/components/Loader";
import { Card } from "@/components/ui";
import { Button, ButtonText } from "@/components/ui/Button";
import { CardContent } from "@/components/ui/Card/CardContent";
import { theme } from "@/components/ui/theme";
import { ThemedText } from "@/components/ui/ThemedText";
import {
  ConfirmImageButton,
  FlipCameraButton,
  GalleryButton,
  RetakeImageButton,
  ReturnCancelButton,
  ShutterButton,
} from "@/core/camera/components";
import { Ionicons } from "@expo/vector-icons";
import { useCameraStore } from "../../core/camera/store/useCameraStore";

export default function CameraScreen() {
  const { selectImage, removeImage, selectedImage } = useCameraStore();

  const [facing, setFacing] = useState<CameraType>("back");
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [, requestMediaPermission] = MediaLibrary.usePermissions();

  const cameraRef = useRef<CameraView>(null);

  const onRequestPermissions = async () => {
    try {
      const { status: cameraPermissionStatus } =
        await requestCameraPermission();

      if (cameraPermissionStatus !== "granted") {
        Alert.alert("Error", "Camera permission not granted");
        return;
      }
      const { status: mediaPermissionStatus } = await requestMediaPermission();
      if (mediaPermissionStatus !== "granted") {
        Alert.alert("Error", "Gallery permission not granted");
        return;
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Permits could not be obtained");
    }
  };

  if (!cameraPermission) {
    // Camera permissions are still loading.
    return <Loader />;
  }

  if (!cameraPermission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={{ ...styles.container, padding: 20 }}>
        <Card>
          <CardContent>
            <View
              style={{
                alignItems: "center",
                marginBottom: 20,
                flexDirection: "row",
                justifyContent: "center",
                gap: 20,
              }}
            >
              <Ionicons name="camera-outline" size={48} color={theme.muted} />
              <Ionicons name="add-outline" size={24} color={theme.muted} />
              <Ionicons name="image-outline" size={48} color={theme.muted} />
            </View>
            <ThemedText style={styles.message}>
              We need your permission to show the camera and gallery
            </ThemedText>
            <Button onPress={onRequestPermissions}>
              <ButtonText>Grant</ButtonText>
            </Button>
          </CardContent>
        </Card>
      </View>
    );
  }

  const onShutterButtonPress = async () => {
    if (!cameraRef.current) return;

    const picture = await cameraRef.current.takePictureAsync({
      quality: 1,
      base64: true,
    });

    if (!picture?.uri) return;

    selectImage(picture);
  };

  const onReturnCancel = () => {
    removeImage();
    router.dismiss();
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const onPictureConfirm = async () => {
    if (!selectedImage) return;
    // Save to media library
    await MediaLibrary.createAssetAsync(selectedImage.uri);
    selectImage(selectedImage);
    router.push("/(app)/expenses/create");
  };

  const onRetakePicture = () => {
    removeImage();
  };

  const onPickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
    });

    if (result.canceled) return;

    removeImage();
    result.assets.map((img) => selectImage(img));

    router.dismiss();
  };

  // Show selected image preview
  if (selectedImage) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: selectedImage.uri }} style={styles.camera} />
        <ConfirmImageButton onPress={onPictureConfirm} />
        <RetakeImageButton onPress={onRetakePicture} />
        <ReturnCancelButton onPress={onReturnCancel} />
      </View>
    );
  }

  // Show camera view
  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        <View style={styles.buttonsBottomContainer}>
          <GalleryButton onPress={onPickImages} />
          <ShutterButton onPress={onShutterButtonPress} />
          <FlipCameraButton onPress={toggleCameraFacing} />
        </View>
        <ReturnCancelButton onPress={onReturnCancel} />
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonsBottomContainer: {
    flex: 1,
    flexDirection: "row",
    position: "absolute",
    bottom: 30,
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
  },
});
