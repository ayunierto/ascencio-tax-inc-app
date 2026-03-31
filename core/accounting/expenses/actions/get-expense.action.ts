import { api } from '@/core/api/api';
import { Expense } from '@ascencio/shared';
import { DateTime } from 'luxon';

export const getExpenseAction = async (id: string): Promise<Expense> => {
  if (id === 'new') {
    return {
      id: 'new',
      merchant: '',
      date: DateTime.utc().toJSDate(),
      createdAt: DateTime.utc().toJSDate(),
      updatedAt: DateTime.utc().toJSDate(),
      total: 0,
      tax: 0,
      imageUrl: undefined,
      notes: undefined,
      category: undefined,
      subcategory: undefined,
      categoryId: '',
      userId: '',
    };
  }

  const { data } = await api.get<Expense>(`/expenses/${id}`);

  return data;
};
