import { api } from '@/core/api/api';
import { Employee } from '@ascencio/shared/interfaces';
import {
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
} from '@ascencio/shared/schemas';

export const createEmployee = async (
  data: CreateEmployeeRequest,
): Promise<Employee> => {
  const { id, ...rest } = data;
  if (id !== 'new') {
    throw new Error('Invalid ID for creating employee');
  }
  const response = await api.post('/employees', rest);
  return response.data;
};

export const updateEmployee = async (
  data: UpdateEmployeeRequest,
): Promise<Employee> => {
  const { id, ...rest } = data;
  const response = await api.patch(`/employees/${id}`, rest);
  return response.data;
};
