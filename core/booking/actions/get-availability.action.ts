import { api } from '@/core/api/api';
import { type SearchAvailabilityRequest } from '@ascencio/shared';
import { AxiosError } from 'axios';
import { AvailableSlot } from '../interfaces/available-slot.interface';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isUuid = (value: string | undefined): value is string => {
  return typeof value === 'string' && UUID_REGEX.test(value);
};

const buildAvailabilityPayload = (
  data: SearchAvailabilityRequest,
): SearchAvailabilityRequest => {
  return {
    serviceId: data.serviceId,
    date: data.date,
    timeZone: data.timeZone,
    ...(isUuid(data.staffId) ? { staffId: data.staffId } : {}),
  };
};

const shouldFallbackToPublicAvailability = (statusCode?: number): boolean => {
  return (
    statusCode === 400 ||
    statusCode === 401 ||
    statusCode === 403 ||
    statusCode === 404
  );
};

export const getAvailabilityAction = async (
  data: SearchAvailabilityRequest,
): Promise<AvailableSlot[]> => {
  const payload = buildAvailabilityPayload(data);

  try {
    return (await api.post<AvailableSlot[]>('/availability/me', payload)).data;
  } catch (error) {
    const axiosError = error as AxiosError;
    const statusCode = axiosError.response?.status;

    if (shouldFallbackToPublicAvailability(statusCode)) {
      return (await api.post<AvailableSlot[]>('/availability', payload)).data;
    }

    throw error;
  }
};
