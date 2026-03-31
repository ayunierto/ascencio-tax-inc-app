import { api } from '@/core/api/api';
import { Invoice, PaginatedResponse } from '@ascencio/shared/interfaces';

export const getInvoicesAction = async (
  status?: string,
): Promise<PaginatedResponse<Invoice>> => {
  const params = status && status !== 'all' ? { status } : {};
  const { data } = await api.get<PaginatedResponse<Invoice>>('/invoices', {
    params,
  });
  return data;
};
