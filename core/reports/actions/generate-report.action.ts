import { api } from '@/core/api/api';

export interface GenerateReportPayload {
  startDate: string;
  endDate: string;
  reportType?: string;
}

export const generateReport = async (payload: GenerateReportPayload) => {
  const { data } = await api.post('/reports/generate', payload);
  return data;
};
