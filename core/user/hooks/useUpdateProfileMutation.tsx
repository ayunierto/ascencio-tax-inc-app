import { useMutation } from '@tanstack/react-query';

import { AxiosError } from 'axios';
import { ServerException } from '@/core/interfaces/server-exception.response';
import { updateProfileAction } from '../actions/update-profile.action';
import { UpdateProfileRequest, UpdateProfileResponse } from '@ascencio/shared';
import { useAuthStore } from '@/core/auth/store/useAuthStore';

export const useUpdateProfileMutation = () => {
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation<
    UpdateProfileResponse,
    AxiosError<ServerException>,
    UpdateProfileRequest
  >({
    mutationFn: updateProfileAction,
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
    },
    onError: (error) => {
      console.error('Update Profile Error:', error);
    },
  });
};
