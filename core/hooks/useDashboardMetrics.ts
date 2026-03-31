import { useQuery } from '@tanstack/react-query';
import { api } from '@/core/api/api';
import { DashboardMetrics } from '@ascencio/shared/interfaces';

export const useDashboardMetrics = () => {
  return useQuery<DashboardMetrics>({
    queryKey: ['dashboard', 'metrics'],
    queryFn: async () => {
      const { data } = await api.get<DashboardMetrics>('/dashboard/metrics');
      return data;
    },
  });
};
