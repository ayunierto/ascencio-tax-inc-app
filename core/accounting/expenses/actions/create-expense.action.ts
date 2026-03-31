import { api } from '@/core/api/api';
import { Expense } from '@ascencio/shared';
import { CreateExpenseRequest } from '@ascencio/shared/schemas';

export const createExpenseAction = async (
  expense: CreateExpenseRequest,
): Promise<Expense> => {
  const { id, ...rest } = expense;

  const { data } = await api.post<Expense>('/expenses', rest);

  return data;
};
