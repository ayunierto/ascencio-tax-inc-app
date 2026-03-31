import { api } from '@/core/api/api';
import { Category } from '../interfaces/category.interface';

export const getCategories = async (): Promise<Category[]> => {
  const { data } = await api.get<Category[]>('/categories');
  return data;
};
