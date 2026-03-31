import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { ServerException } from '@/core/interfaces/server-exception.response';
import { Client, PaginatedResponse } from '@ascencio/shared/interfaces';
import {
  CreateClientRequest,
  UpdateClientRequest,
} from '@ascencio/shared/schemas';
import {
  createClient,
  updateClient,
  deleteClientAction,
  getClientsAction,
  getClientAction,
} from '../actions';

// ========================
// Query: Obtener todos los clientes
// ========================
export const useClients = () => {
  return useQuery<
    PaginatedResponse<Client>,
    AxiosError<ServerException>,
    PaginatedResponse<Client>,
    string[]
  >({
    queryKey: ['clients'],
    queryFn: getClientsAction,
    retry: 1,
  });
};

// ========================
// Query: Obtener un cliente por ID
// ========================
export const useClient = (id: string) => {
  return useQuery<Client, AxiosError<ServerException>, Client>({
    queryKey: ['client', id],
    queryFn: () => getClientAction(id),
    refetchOnWindowFocus: true,
    retry: 1,
  });
};

// ========================
// Mutation: Crear cliente
// ========================
export const createClientMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Client, AxiosError<ServerException>, CreateClientRequest>({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};

// ========================
// Mutation: Actualizar cliente
// ========================
export const updateClientMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Client, AxiosError<ServerException>, UpdateClientRequest>({
    mutationFn: updateClient,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', data.id] });
    },
  });
};

// ========================
// Mutation: Eliminar cliente
// ========================
export const deleteClientMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<{ id: string }, AxiosError<ServerException>, string>({
    mutationFn: deleteClientAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};
