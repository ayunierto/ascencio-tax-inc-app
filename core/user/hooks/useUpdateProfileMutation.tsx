import { useMutation } from '@tanstack/react-query';

import { AxiosError } from 'axios';
import { ServerException } from '@/core/interfaces/server-exception.response';
import { updateProfileAction } from '../actions/update-profile.action';
import { UpdateProfileRequest, UpdateProfileResponse } from '@ascencio/shared';

export const useUpdateProfileMutation = () => {
  return useMutation<
    UpdateProfileResponse,
    AxiosError<ServerException>,
    UpdateProfileRequest
  >({
    mutationFn: updateProfileAction,
    onError: (error) => {
      console.error('Update Profile Error:', error);
    },
  });
};
