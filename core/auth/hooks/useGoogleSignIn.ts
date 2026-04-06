import { useState, useEffect } from 'react';
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
    const webClientId = googleWebClientId?.trim();

    if (webClientId) {
      GoogleSignin.configure({
        webClientId,
        offlineAccess: false,
      });
      setIsReady(true);
    } else {
      console.warn('googleWebClientId no está configurado en mobile-config');
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

      // Verificar si Google Play Services está disponible
      await GoogleSignin.hasPlayServices();

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

      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        errorMessageKey = 'googleSignInError';
      } else if (err.code === statusCodes.IN_PROGRESS) {
        errorMessageKey = 'googleSignInError';
      } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        errorMessageKey = 'googleSignInError';
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
