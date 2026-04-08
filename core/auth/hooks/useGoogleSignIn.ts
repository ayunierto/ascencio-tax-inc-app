import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { isAxiosError } from 'axios';
import { useMobileConfigStore } from '@/core/config/store/useMobileConfigStore';
import { useAuthStore } from '../store/useAuthStore';

export const useGoogleSignIn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isReady, setIsReady] = useState(false);
  const { signInWithGoogle } = useAuthStore();
  const loadMobileConfig = useMobileConfigStore((state) => state.loadConfig);
  const googleWebClientId = useMobileConfigStore(
    (state) => state.config?.googleWebClientId,
  );

  useEffect(() => {
    void loadMobileConfig();
  }, [loadMobileConfig]);

  useEffect(() => {
    // Configurar Google Sign-In
    const webClientIdFromEnv =
      process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();
    const webClientId = webClientIdFromEnv || googleWebClientId?.trim();
    const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim();

    const isIos = Platform.OS === 'ios';
    const hasRequiredIds = isIos
      ? !!webClientId && !!iosClientId
      : !!webClientId;

    if (hasRequiredIds) {
      GoogleSignin.configure({
        webClientId,
        iosClientId,
        offlineAccess: false,
      });
      setIsReady(true);
    } else {
      if (!webClientId) {
        console.warn(
          'googleWebClientId no está configurado ni en mobile-config ni en EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID',
        );
      }

      if (isIos && !iosClientId) {
        console.warn(
          'EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID no está configurado para iOS',
        );
      }

      setIsReady(false);
    }
  }, [googleWebClientId]);

  const signInWithGoogleAsync = async () => {
    try {
      if (!isReady) {
        throw new Error('googleSignInNotReady');
      }

      setIsLoading(true);
      setError(null);

      // Verificar Google Play Services solo en Android
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices();
      }

      // Iniciar el flujo de sign-in
      const userInfo = await GoogleSignin.signIn();

      // Obtener el idToken (JWT de Google)
      const idToken = userInfo.data?.idToken;

      if (!idToken) {
        throw new Error('No ID token received from Google');
      }

      // Enviar el idToken al backend para verificación y autenticación
      await signInWithGoogle(idToken);
    } catch (err: any) {
      let errorMessageKey = 'googleSignInError';
      const nativeMessage =
        err instanceof Error
          ? err.message
          : typeof err?.message === 'string'
            ? err.message
            : '';
      const isMissingIosUrlScheme =
        Platform.OS === 'ios' &&
        nativeMessage.includes('missing support for the following URL schemes');

      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        errorMessageKey = 'googleSignInError';
      } else if (err.code === statusCodes.IN_PROGRESS) {
        errorMessageKey = 'googleSignInError';
      } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        errorMessageKey = 'googleSignInDeveloperError';
      } else if (isMissingIosUrlScheme) {
        errorMessageKey = 'googleSignInDeveloperError';
      } else if (isAxiosError(err) && !err.response) {
        errorMessageKey = 'networkConnectionError';
      } else if (isAxiosError(err) && err.response?.data?.message) {
        errorMessageKey = err.response.data.message;
      }

      const mappedError = new Error(errorMessageKey);
      setError(mappedError);
      console.error('Google Sign-In Error:', err);
      throw mappedError;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signInWithGoogle: signInWithGoogleAsync,
    isLoading,
    error,
    isReady,
  };
};
