import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { ServerException } from '@/core/interfaces/server-exception.response';
import { getServicesAction } from '../actions/get-services.action';
import type { Service, PaginatedResponse } from '@ascencio/shared';

export const useServices = (limit: number = 100, offset = 0) => {
  return useQuery<
    PaginatedResponse<Service>,
    AxiosError<ServerException>,
    PaginatedResponse<Service>
  >({
    queryKey: ['services', { offset, limit }],
    queryFn: () =>
      getServicesAction({
        limit: isNaN(limit) ? 9 : limit,
        offset: isNaN(offset) ? 0 : offset,
      }),
    // staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    retry: false,
  });
};
