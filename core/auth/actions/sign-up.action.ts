import { api } from '@/core/api/api';
import { SignUpRequest, SignUpResponse } from '@ascencio/shared';

export const signUpAction = async (
  newUser: SignUpRequest,
): Promise<SignUpResponse> => {
  newUser.email = newUser.email.toLocaleLowerCase().trim();
  const { data } = await api.post<SignUpResponse>('/auth/signup', newUser);

  return data;
};
