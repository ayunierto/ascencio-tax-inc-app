import { api } from '@/core/api/api';

export const deleteInvoiceAction = async (id: string): Promise<{ id: string }> => {
  await api.delete(`/invoices/${id}`);
  return { id };
};

export const bulkDeleteInvoicesAction = async (ids: string[]): Promise<void> => {
  await api.post('/invoices/bulk-delete', { ids });
};
