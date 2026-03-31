import { useState, useEffect } from 'react';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { useAuthStore } from '../store/useAuthStore';

export const useGoogleSignIn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isReady, setIsReady] = useState(false);
  const { signInWithGoogle } = useAuthStore();

  const apiUrl =
    process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    // Configurar Google Sign-In
    const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

    if (webClientId) {
      GoogleSignin.configure({
        webClientId,
        offlineAccess: false,
      });
      setIsReady(true);
    } else {
      console.warn('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID no está configurado');
      setIsReady(false);
    }
  }, []);

  const signInWithGoogleAsync = async () => {
    try {
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
      let errorMessage = 'Failed to authenticate';

      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        errorMessage = 'Sign in cancelled';
      } else if (err.code === statusCodes.IN_PROGRESS) {
        errorMessage = 'Sign in already in progress';
      } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        errorMessage = 'Play services not available';
      }

      const error = new Error(errorMessage);
      setError(error);
      console.error('Google Sign-In Error:', err);
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
