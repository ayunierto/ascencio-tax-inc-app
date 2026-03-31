import { api } from '@/core/api/api';
import { Payment, AccountReceivable } from '@ascencio/shared/interfaces';

export const recordPaymentAction = async (paymentData: {
  accountReceivableId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  reference?: string;
  notes?: string;
}): Promise<Payment> => {
  const { data } = await api.post<Payment>('/payments', paymentData);
  return data;
};

export const getPaymentsAction = async (
  accountReceivableId?: string
): Promise<Payment[]> => {
  const { data } = await api.get<Payment[]>('/payments', {
    params: { accountReceivableId },
  });
  return data;
};

export const getAccountsReceivableAction = async (
  companyId: string,
  status?: string
): Promise<{ items: AccountReceivable[]; total: number }> => {
  const { data } = await api.get<{ items: AccountReceivable[]; total: number }>(
    '/accounts-receivable',
    {
      params: { companyId, status },
    }
  );
  return data;
};
