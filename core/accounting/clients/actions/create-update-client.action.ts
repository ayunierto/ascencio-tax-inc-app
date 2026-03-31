import { api } from '@/core/api/api';
import {
  CreateClientRequest,
  Client,
  UpdateClientRequest,
} from '@ascencio/shared';

/**
 * Crea un nuevo cliente
 */
export const createClient = async (
  client: CreateClientRequest
): Promise<Client> => {
  const { id, ...rest } = client;
  const { data } = await api.post<Client>('/clients', rest);
  return data;
};

/**
 * Actualiza un cliente existente
 */
export const updateClient = async (
  client: UpdateClientRequest
): Promise<Client> => {
  const { id } = client;
  const { data } = await api.patch<Client>(`/clients/${id}`, client);
  return data;
};
