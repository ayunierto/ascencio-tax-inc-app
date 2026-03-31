import { ServerException } from '@/core/interfaces/server-exception.response';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ForgotPasswordResponse } from '../interfaces/forgot-password.response';
import { ForgotPasswordRequest } from '../schemas/forgot-password.schema';
import { useAuthStore } from '../store/useAuthStore';

export const useForgotPasswordMutation = () => {
  const { forgotPassword } = useAuthStore();

  return useMutation<
    ForgotPasswordResponse,
    AxiosError<ServerException>,
    ForgotPasswordRequest
  >({
    mutationFn: async (data: ForgotPasswordRequest) => {
      return await forgotPassword(data);
    },
    onError: (error) => {
      console.error(error);
    },
  });
};
