import { api } from '@/core/api/api';
import { SignInRequest, SignInResponse } from '@ascencio/shared';

export const signInAction = async (
  credentials: SignInRequest,
): Promise<SignInResponse> => {
  credentials.email = credentials.email.toLocaleLowerCase().trim();
  const { data } = await api.post<SignInResponse>('/auth/signin', credentials);

  return data;
};
