import { api } from '@/core/api/api';
import { SignInResponse } from '@ascencio/shared';

/**
 * Esta acción envía el idToken de Google al backend para verificación
 */
export const signInWithGoogleAction = async (
  idToken: string,
): Promise<SignInResponse> => {
  const { data } = await api.post<SignInResponse>('/auth/google/verify', {
    idToken,
  });

  return data;
};
