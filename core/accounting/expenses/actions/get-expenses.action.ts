import { api } from '@/core/api/api';
import { Expense } from '@ascencio/shared';

export const getExpenses = async (
  limit = 20,
  offset = 0,
): Promise<Expense[]> => {
  const { data } = await api.get<Expense[]>(
    `expenses?limit=${limit}&offset=${offset}`,
  );
  return data;
};
