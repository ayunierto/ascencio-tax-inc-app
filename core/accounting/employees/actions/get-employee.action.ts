import { api } from '@/core/api/api';
import { Employee } from '@ascencio/shared/interfaces';

export const getEmployeeAction = async (id: string): Promise<Employee> => {
  const { data } = await api.get<Employee>(`/employees/${id}`);
  return data;
};
