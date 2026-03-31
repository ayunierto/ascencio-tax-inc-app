import { api } from '@/core/api/api';
import { ResendEmailCodeResponse } from '@ascencio/shared';

export const resendCode = async (
  email: string,
): Promise<ResendEmailCodeResponse> => {
  const { data } = await api.post('/auth/resend-email-code', {
    email: email.toLocaleLowerCase().trim(),
  });

  return data;
};
