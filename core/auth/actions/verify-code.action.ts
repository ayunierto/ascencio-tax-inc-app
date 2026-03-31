import { api } from '@/core/api/api';
import {
  VerifyEmailCodeRequest,
  VerifyEmailCodeResponse,
} from '@ascencio/shared';

export const verifyCodeAction = async (
  request: VerifyEmailCodeRequest,
): Promise<VerifyEmailCodeResponse> => {
  request.email = request.email.toLocaleLowerCase().trim();
  const { data } = await api.post<VerifyEmailCodeResponse>(
    '/auth/verify-email-code',
    request,
  );

  return data;
};
