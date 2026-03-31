import { api } from '@/core/api/api';
import { Invoice } from '@ascencio/shared/interfaces';
import {
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
} from '@ascencio/shared/schemas';

export const createInvoice = async (
  data: CreateInvoiceRequest,
): Promise<Invoice> => {
  const response = await api.post<Invoice>('/invoices', data);
  return response.data;
};

export const updateInvoice = async (
  id: string,
  data: UpdateInvoiceRequest,
): Promise<Invoice> => {
  const response = await api.patch<Invoice>(`/invoices/${id}`, data);
  return response.data;
};
