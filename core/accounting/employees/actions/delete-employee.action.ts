import { api } from '@/core/api/api';

export const deleteEmployeeAction = async (id: string): Promise<{ id: string }> => {
  await api.delete(`/employees/${id}`);
  return { id };
};
