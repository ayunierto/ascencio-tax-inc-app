import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { ServerException } from '@/core/interfaces/server-exception.response';
import { Company, PaginatedResponse } from '@ascencio/shared/interfaces';
import {
  CreateCompanyRequest,
  UpdateCompanyRequest,
} from '@ascencio/shared/schemas';
import {
  createCompany,
  updateCompany,
  deleteCompanyAction,
  getCompaniesAction,
  getCompanyAction,
} from '../actions';

export const useCompanies = () => {
  return useQuery<
    PaginatedResponse<Company>,
    AxiosError<ServerException>,
    PaginatedResponse<Company>,
    string[]
  >({
    queryKey: ['companies'],
    queryFn: getCompaniesAction,
    retry: 1,
  });
};

export const useCompany = (id: string) => {
  return useQuery<Company, AxiosError<ServerException>, Company>({
    queryKey: ['company', id],
    queryFn: () => getCompanyAction(id),
    refetchOnWindowFocus: true,
    retry: 1,
    staleTime: 0, // Always refetch to get latest image
  });
};

export const createCompanyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Company,
    AxiosError<ServerException>,
    CreateCompanyRequest
  >({
    mutationFn: createCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
};

export const updateCompanyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Company,
    AxiosError<ServerException>,
    UpdateCompanyRequest
  >({
    mutationFn: updateCompany,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['company', data.id] });
    },
  });
};

export const deleteCompanyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<{ id: string }, AxiosError<ServerException>, string>({
    mutationFn: deleteCompanyAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
};
