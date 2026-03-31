import { api } from '@/core/api/api';
import { PaginatedResponse, Service } from '@ascencio/shared';

interface Options {
  limit?: number | string;
  offset?: number | string;
}

export const getServicesAction = async (
  options: Options,
): Promise<PaginatedResponse<Service>> => {
  const { limit, offset } = options;
  const { data } = await api.get<PaginatedResponse<Service>>('/services', {
    params: {
      limit,
      offset,
    },
  });

  return data;
};
