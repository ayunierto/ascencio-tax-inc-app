import { api } from '@/core/api/api';

export const deleteCompanyAction = async (
  id: string,
): Promise<{ id: string }> => {
  const { data } = await api.delete<{ id: string }>(`/companies/${id}`);
  return data;
};
