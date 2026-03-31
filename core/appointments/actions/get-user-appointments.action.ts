import { api } from '@/core/api/api';
import { GetCurrentUserAppointmentsResponse } from '../interfaces';

export const getUserAppointments = async (
  state: 'pending' | 'past' = 'pending'
) => {
  const { data } = await api.get<GetCurrentUserAppointmentsResponse>(
    '/appointments/current-user',
    {
      params: {
        state,
      },
    }
  );

  return data;
};
