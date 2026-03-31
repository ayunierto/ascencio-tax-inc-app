import { api } from '@/core/api/api';
import {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
} from '@ascencio/shared';

export const forgotPasswordAction = async ({
  email,
}: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
  const { data } = await api.post<ForgotPasswordResponse>(
    '/auth/forgot-password',
    { email },
  );

  return data;
};
