import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { ServerException } from '@/core/interfaces/server-exception.response';
import { Employee, PaginatedResponse } from '@ascencio/shared/interfaces';
import {
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
} from '@ascencio/shared/schemas';
import {
  createEmployee,
  updateEmployee,
  deleteEmployeeAction,
  getEmployeesAction,
  getEmployeeAction,
} from '../actions';

export const useEmployees = (companyId?: string) => {
  return useQuery<
    PaginatedResponse<Employee>,
    AxiosError<ServerException>,
    PaginatedResponse<Employee>,
    (string | undefined)[]
  >({
    queryKey: ['employees', companyId],
    queryFn: () => getEmployeesAction(companyId),
    retry: 1,
  });
};

export const useEmployee = (id: string) => {
  return useQuery<Employee, AxiosError<ServerException>, Employee>({
    queryKey: ['employee', id],
    queryFn: () => getEmployeeAction(id),
    refetchOnWindowFocus: true,
    retry: 1,
    staleTime: 0,
    enabled: !!id && id !== 'new',
  });
};

export const useCreateEmployeeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Employee,
    AxiosError<ServerException>,
    CreateEmployeeRequest
  >({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

export const useUpdateEmployeeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Employee,
    AxiosError<ServerException>,
    UpdateEmployeeRequest
  >({
    mutationFn: updateEmployee,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', data.id] });
    },
  });
};

export const useDeleteEmployeeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<{ id: string }, AxiosError<ServerException>, string>({
    mutationFn: deleteEmployeeAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};
