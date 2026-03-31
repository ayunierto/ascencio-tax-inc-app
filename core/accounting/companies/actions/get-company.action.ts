import { api } from '@/core/api/api';
import { Company } from '@ascencio/shared/interfaces';

export const getCompanyAction = async (id: string): Promise<Company> => {
  const { data } = await api.get<Company>(`/companies/${id}`);
  return data;
};
