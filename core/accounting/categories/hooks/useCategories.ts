import { ServerException } from '@/core/interfaces/server-exception.response';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { getCategories } from '../actions';
import { Category } from '../interfaces/category.interface';

export const useCategories = () => {
  return useQuery<
    Category[],
    AxiosError<ServerException>,
    Category[],
    string[]
  >({
    queryKey: ['categories'],
    queryFn: getCategories,
  });
};
