import { api } from '@/core/api/api';

/**
 * Elimina un cliente (soft delete)
 */
export const deleteClientAction = async (
  id: string
): Promise<{ id: string }> => {
  const { data } = await api.delete<{ id: string }>(`/clients/${id}`);
  return data;
};
