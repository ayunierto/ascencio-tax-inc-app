import { api } from '@/core/api/api';
import { Report } from '../interfaces';

export const getReports = async (
  limit = 100,
  offset = 0
): Promise<Report[]> => {
  const { data } = await api.get<Report[]>(
    `reports?limit=${limit}&offset=${offset}`
  );

  return data;
};
