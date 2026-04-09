import { api } from '@/core/api/api';

export interface AppointmentAddToCalendarData {
  ics: string;
  googleCalendarUrl: string;
  title: string;
  start: string;
  end: string;
}

export const getAppointmentAddToCalendarDataAction = async (
  appointmentId: string,
): Promise<AppointmentAddToCalendarData> => {
  return (
    await api.get<AppointmentAddToCalendarData>(
      `/appointments/${appointmentId}/add-to-calendar`,
      {
        params: { format: 'json' },
      },
    )
  ).data;
};
