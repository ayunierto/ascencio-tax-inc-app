import { api } from '@/core/api/api';
import { Staff } from '../interfaces';

export const getStaffAction = async () => {
  return (await api.get<Staff[]>('/staff')).data;
};
