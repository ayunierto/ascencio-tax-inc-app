import { api } from '@/core/api/api';
import { Expense } from '@ascencio/shared';

export const deleteExpense = async (id: string): Promise<Expense> => {
  const { data } = await api.delete<Expense>(`/expenses/${id}`);
  return data;
};
