import { api } from '@/core/api/api';
import { Employee, PaginatedResponse } from '@ascencio/shared/interfaces';

export const getEmployeesAction = async (
  companyId?: string,
): Promise<PaginatedResponse<Employee>> => {
  const params = companyId ? { companyId } : {};
  const { data } = await api.get<PaginatedResponse<Employee>>('/employees', {
    params,
  });
  return data;
};
