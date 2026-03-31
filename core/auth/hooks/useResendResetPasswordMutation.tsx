import { ServerException } from '@/core/interfaces/server-exception.response';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import Toast from 'react-native-toast-message';
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
      Toast.show({
        type: 'error',
        text1: 'Resend Reset Password Code Error',
        text2: error.response?.data.message || error.message,
      });
    },
  });
};

import { api } from '@/core/api/api';

async function resendResetPasswordCode(email: string): Promise<ResendResetPasswordCodeResponse> {
  const { data } = await api.post('/auth/resend-reset-password-code', {
    email: email.toLocaleLowerCase().trim(),
  });
  return data;
}
