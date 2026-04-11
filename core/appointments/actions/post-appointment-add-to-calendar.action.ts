import { api } from '@/core/api/api';

export interface AppointmentAutoAddToCalendarResponse {
  added: true;
  externalEventId: string;
}

export const postAppointmentAddToCalendarAction = async (
  appointmentId: string,
): Promise<AppointmentAutoAddToCalendarResponse> => {
  return (
    await api.post<AppointmentAutoAddToCalendarResponse>(
      `/appointments/${appointmentId}/add-to-calendar`,
    )
  ).data;
};
