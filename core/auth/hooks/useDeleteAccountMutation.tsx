import { useMutation } from '@tanstack/react-query';

import { ServerException } from '@/core/interfaces/server-exception.response';
import { AxiosError } from 'axios';
import { DeleteAccountResponse } from '../interfaces/delete-account.response';
import { DeleteAccountRequest } from '../schemas/delete-account.schema';
import { useAuthStore } from '../store/useAuthStore';

export const useDeleteAccountMutation = () => {
  const { deleteAccount } = useAuthStore();

  return useMutation<DeleteAccountResponse, AxiosError<ServerException>, DeleteAccountRequest>({
    mutationFn: deleteAccount,
    onError: (error) => {
      console.error('Delete Account Error:', error);
    },
  });
};
