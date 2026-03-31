import { api } from '@/core/api/api';
import {
  CreateCompanyRequest,
  Company,
  UpdateCompanyRequest,
} from '@ascencio/shared';

export const createCompany = async (
  company: CreateCompanyRequest
): Promise<Company> => {
  const { id, ...rest } = company;
  const { data } = await api.post<Company>('/companies', rest);
  return data;
};

export const updateCompany = async (
  company: UpdateCompanyRequest
): Promise<Company> => {
  const { id } = company;
  const { data } = await api.patch<Company>(`/companies/${id}`, company);
  return data;
};
