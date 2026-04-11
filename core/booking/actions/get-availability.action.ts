import { api } from '@/core/api/api';
import { type SearchAvailabilityRequest } from '@ascencio/shared';
import { AxiosError } from 'axios';
import { AvailableSlot } from '../interfaces/available-slot.interface';

export const getAvailabilityAction = async (
  data: SearchAvailabilityRequest,
): Promise<AvailableSlot[]> => {
  try {
    return (await api.post<AvailableSlot[]>('/availability/me', data)).data;
  } catch (error) {
    const axiosError = error as AxiosError;
    const statusCode = axiosError.response?.status;

    if (statusCode === 401 || statusCode === 403) {
      return (await api.post<AvailableSlot[]>('/availability', data)).data;
    }

    throw error;
  }
};
