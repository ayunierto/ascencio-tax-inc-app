import { api } from '@/core/api/api';
import { ResetPasswordRequest, ResetPasswordResponse } from '@ascencio/shared';

export const resetPasswordAction = async (
  request: ResetPasswordRequest,
): Promise<ResetPasswordResponse> => {
  const { data } = await api.post<ResetPasswordResponse>(
    '/auth/reset-password',
    request,
  );

  return data;
};
