import { api } from '@/core/api/api';
import { CreateInvoicePaymentRequest, Invoice } from '@ascencio/shared';

/**
 * Record a payment on an invoice
 */
export const recordInvoicePayment = async (
  invoiceId: string,
  data: CreateInvoicePaymentRequest,
): Promise<Invoice> => {
  const response = await api.post<Invoice>(
    `/invoices/${invoiceId}/payment`,
    data,
  );
  return response.data;
};
