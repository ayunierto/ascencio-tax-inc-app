import { api } from '@/core/api/api';
import { Company, PaginatedResponse } from '@ascencio/shared/interfaces';

export const getCompaniesAction = async (): Promise<
  PaginatedResponse<Company>
> => {
  const { data } = await api.get<PaginatedResponse<Company>>('/companies');
  return data;
};
