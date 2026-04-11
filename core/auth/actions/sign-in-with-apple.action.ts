import { api } from '@/core/api/api';
import { SignInResponse } from '@ascencio/shared';

interface AppleSignInPayload {
  identityToken: string;
  fullName?: {
    givenName?: string | null;
    familyName?: string | null;
  } | null;
}

/**
 * Envía el identityToken de Apple al backend para verificación y autenticación.
 */
export const signInWithAppleAction = async (
  payload: AppleSignInPayload,
): Promise<SignInResponse> => {
  const { data } = await api.post<SignInResponse>('/auth/apple/verify', payload);
  return data;
};
