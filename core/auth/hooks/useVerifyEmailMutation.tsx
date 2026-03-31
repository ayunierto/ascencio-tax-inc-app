import { router } from 'expo-router';
import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';

import { ServerException } from '@/core/interfaces/server-exception.response';
import { useAuthStore } from '../store/useAuthStore';
import {
  VerifyEmailCodeRequest,
  VerifyEmailCodeResponse,
} from '@ascencio/shared';

export const useVerifyEmailMutation = () => {
  const { verifyCode } = useAuthStore();

  return useMutation<
    VerifyEmailCodeResponse,
    AxiosError<ServerException>,
    VerifyEmailCodeRequest
  >({
    mutationFn: async (data: VerifyEmailCodeRequest) => {
      const response = await verifyCode(data);
      return response;
    },
  });
};
