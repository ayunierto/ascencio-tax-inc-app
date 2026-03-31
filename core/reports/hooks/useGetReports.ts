import { useQuery } from '@tanstack/react-query';
import { getReports, GetReportsParams } from '../actions/get-reports.action';

export const useGetReports = (params?: GetReportsParams) => {
  return useQuery({
    queryKey: ['reports', params],
    queryFn: () => getReports(params),
    staleTime: 0,
  });
};
