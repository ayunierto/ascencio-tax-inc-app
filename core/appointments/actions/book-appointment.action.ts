import { api } from '@/core/api/api';
import { Appointment } from '../interfaces';
import { AppointmentRequest } from '../interfaces/appointment-request.interface';

export const bookAppointment = async (appointments: AppointmentRequest) => {
  return (await api.post<Appointment>('/appointments', appointments)).data;
};
