import { api } from '@/core/api/api';
import { Expense } from '@ascencio/shared';
import { UpdateExpenseRequest } from '@ascencio/shared/schemas';

export const updateExpenseAction = async (
  expense: UpdateExpenseRequest,
): Promise<Expense> => {
  const { id, ...rest } = expense;
  const { data } = await api.patch<Expense>(`/expenses/${id}`, rest);

  return data;
};
