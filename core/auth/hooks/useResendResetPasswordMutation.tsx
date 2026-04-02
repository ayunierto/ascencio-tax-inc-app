import { ServerException } from '@/core/interfaces/server-exception.response';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner-native';
import { ResendResetPasswordCodeResponse } from '../interfaces/resend-reset-password-code.response';

export const useResendResetPasswordMutation = () => {
  return useMutation<
    ResendResetPasswordCodeResponse,
    AxiosError<ServerException>,
    string
  >({
    mutationFn: async (email) => {
      return await resendResetPasswordCode(email);
    },
    onError: (error) => {
      toast.error(error.response?.data.message || error.message, {
        description: 'Resend reset password code error',
      });
    },
  });
};

import { api } from '@/core/api/api';

async function resendResetPasswordCode(
  email: string,
): Promise<ResendResetPasswordCodeResponse> {
  const { data } = await api.post('/auth/resend-reset-password-code', {
    email: email.toLocaleLowerCase().trim(),
  });
  return data;
}
