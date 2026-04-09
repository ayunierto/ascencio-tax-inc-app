import { api } from '@/core/api/api';

export interface ClientCalendarStatusResponse {
  connected: boolean;
  email?: string | null;
  calendarId?: string | null;
  webhookActive?: boolean;
  updatedAt?: string;
}

export interface ClientCalendarConnectResponse {
  url: string;
}

export interface ClientCalendarConnectQuery {
  redirectUrl?: string;
}

export const getClientCalendarStatusAction = async () => {
  return (
    await api.get<ClientCalendarStatusResponse>('/calendar/oauth/client/status')
  ).data;
};

export const getClientCalendarConnectUrlAction = async (
  query?: ClientCalendarConnectQuery,
) => {
  return (
    await api.get<ClientCalendarConnectResponse>('/calendar/oauth/client/connect', {
      params: query,
    })
  ).data;
};

export const disconnectClientCalendarAction = async () => {
  return (
    await api.post<{ disconnected: boolean }>(
      '/calendar/oauth/client/me/disconnect',
    )
  ).data;
};
