import { ServerException } from '@/core/interfaces/server-exception.response';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { getStaffAction } from '../actions/get-staff.action';
import { Staff } from '../interfaces';

export const useStaff = () => {
  return useQuery<Staff[], AxiosError<ServerException>, Staff[], string[]>({
    queryKey: ['staff'],
    queryFn: getStaffAction,
  });
};
