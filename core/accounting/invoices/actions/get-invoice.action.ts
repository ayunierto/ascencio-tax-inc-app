import { api } from '@/core/api/api';
import { Invoice } from '@ascencio/shared/interfaces';

export const getInvoiceAction = async (id: string): Promise<Invoice> => {
  const { data } = await api.get<Invoice>(`/invoices/${id}`);
  return data;
};
