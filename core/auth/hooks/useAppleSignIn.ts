import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuthStore } from '../store/useAuthStore';

export const useAppleSignIn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const { signInWithApple } = useAuthStore();

  useEffect(() => {
    // Apple Sign-In sólo está disponible en iOS
    if (Platform.OS !== 'ios') {
      setIsAvailable(false);
      return;
    }

    AppleAuthentication.isAvailableAsync()
      .then(setIsAvailable)
      .catch(() => setIsAvailable(false));
  }, []);

  const signInWithAppleAsync = async () => {
    if (isLoading) {
      return false;
    }

    if (Platform.OS !== 'ios') {
      throw new Error('appleSignInNotAvailable');
    }

    try {
      setIsLoading(true);
      setError(null);

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error('appleSignInNoToken');
      }

      await signInWithApple(credential.identityToken, credential.fullName);
      return true;
    } catch (err: unknown) {
      if (
        err instanceof Error &&
        (err as { code?: string }).code === 'ERR_REQUEST_CANCELED'
      ) {
        // El usuario canceló el flujo, no es un error real
        return false;
      }

      const errorMessage =
        err instanceof Error ? err.message : 'appleSignInError';

      const wrappedError = new Error(errorMessage);
      setError(wrappedError);
      throw wrappedError;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signInWithApple: signInWithAppleAsync,
    isLoading,
    error,
    isAvailable,
  };
};
