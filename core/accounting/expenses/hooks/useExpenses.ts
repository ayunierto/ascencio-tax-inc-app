import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  createExpenseAction,
  updateExpenseAction,
  deleteExpense,
  getExpenseAction,
  getExpenses,
} from '../actions';
import {
  CreateExpenseRequest,
  Expense,
  ServerException,
  UpdateExpenseRequest,
} from '@ascencio/shared';
import { AxiosError } from 'axios';

// ========================
// Query: Obtener todos los recursos
// ========================
export const useExpenses = () => {
  const expensesQuery = useInfiniteQuery<
    Expense[],
    AxiosError<ServerException>,
    InfiniteData<Expense[], unknown>,
    string[],
    number
  >({
    queryKey: ['expenses', 'infinite'],
    queryFn: ({ pageParam }) => getExpenses(10, pageParam * 10),
    staleTime: 1000 * 60 * 60,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => allPages.length,
    retry: false,
  });

  return {
    expensesQuery,

    // Methods
    loadNextPage: expensesQuery.fetchNextPage,
  };
};

// ========================
// Query: Obtener un recurso por ID
// ========================
export const useExpense = (id: string) => {
  return useQuery<Expense, AxiosError<ServerException>, Expense>({
    queryKey: ['expense', id],
    queryFn: async () => await getExpenseAction(id),
    // staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
    retry: 1,
    staleTime: 0,
  });
};

// ========================
// Mutation:  Create expense
// ========================
export const createExpenseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Expense,
    AxiosError<ServerException>,
    CreateExpenseRequest
  >({
    mutationFn: createExpenseAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expenses', 'infinite'] });
    },
  });
};

// ========================
// Mutation: Update expense
// ========================
export const updateExpenseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Expense,
    AxiosError<ServerException>,
    UpdateExpenseRequest
  >({
    mutationFn: updateExpenseAction,
    onSuccess: (data) => {
      // Invalidar tanto la lista como el recurso individual
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense', data.id] });
    },
  });
};

// ========================
// Mutation: Remove expense
// ========================
export const deleteExpenseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Expense, AxiosError<ServerException>, string>({
    mutationFn: deleteExpense,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expenses', 'infinite'] });
      queryClient.invalidateQueries({ queryKey: ['expense', data.id] });
    },
  });
};
