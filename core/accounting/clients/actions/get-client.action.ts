import { api } from '@/core/api/api';
import { Client } from '@ascencio/shared/interfaces';

/**
 * Obtiene un cliente específico por su ID
 */
export const getClientAction = async (id: string): Promise<Client> => {
  const { data } = await api.get<Client>(`/clients/${id}`);
  return data;
};
