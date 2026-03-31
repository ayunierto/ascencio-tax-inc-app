import { api } from '@/core/api/api';
import { DeleteAccountResponse, DeleteAccountRequest } from '@ascencio/shared';

export const deleteAccountAction = async (
  request: DeleteAccountRequest,
): Promise<DeleteAccountResponse> => {
  const { data } = await api.post<DeleteAccountResponse>(
    '/auth/delete-account',
    request,
  );

  return data;
};
