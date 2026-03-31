import { api } from '@/core/api/api';
import { UpdateProfileRequest, UpdateProfileResponse } from '@ascencio/shared';

export const updateProfileAction = async (
  values: UpdateProfileRequest,
): Promise<UpdateProfileResponse> => {
  const { data } = await api.patch<UpdateProfileResponse>(
    'auth/update-profile',
    values,
  );

  return data;
};
