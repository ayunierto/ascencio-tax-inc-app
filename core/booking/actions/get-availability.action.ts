import { api } from '@/core/api/api';
import { type SearchAvailabilityRequest } from '@ascencio/shared';
import { AvailableSlot } from '../interfaces/available-slot.interface';

export const getAvailabilityAction = async (
  data: SearchAvailabilityRequest,
): Promise<AvailableSlot[]> => {
  return (await api.post<AvailableSlot[]>('/availability', data)).data;
};
