import { api } from '@/core/api/api';
import { CheckStatusResponse } from '@ascencio/shared/interfaces';

export const checkAuthStatusAction = async (): Promise<CheckStatusResponse> => {
  const { data } = await api.get<CheckStatusResponse>('/auth/check-status');
  return data;
};
