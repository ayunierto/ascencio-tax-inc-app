import { api } from '@/core/api/api';
import { Client, PaginatedResponse } from '@ascencio/shared/interfaces';

/**
 * Obtiene la lista paginada de clientes del usuario actual
 */
export const getClientsAction = async (): Promise<
  PaginatedResponse<Client>
> => {
  const { data } = await api.get<PaginatedResponse<Client>>('/clients');
  return data;
};
