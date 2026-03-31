import { api } from '@/core/api/api';

export interface Report {
  id: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface GetReportsParams {
  limit?: number;
  offset?: number;
}

export const getReports = async (params?: GetReportsParams) => {
  const { data } = await api.get<Report[]>('/reports', { params });
  return data;
};
