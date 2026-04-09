import * as ExpoLinking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { getClientCalendarConnectUrlAction } from '../actions';

export type ClientCalendarOAuthStatus = 'success' | 'cancel' | 'error';

export interface ClientCalendarOAuthResult {
  status: ClientCalendarOAuthStatus;
  error?: string;
}

const getErrorFromCallbackUrl = (url: string): string | undefined => {
  const parsed = ExpoLinking.parse(url);
  const rawError = parsed.queryParams?.error;

  if (typeof rawError === 'string' && rawError.trim().length > 0) {
    return rawError;
  }

  return undefined;
};

export const startClientCalendarOAuth = async (
  redirectPath: string,
): Promise<ClientCalendarOAuthResult> => {
  const redirectUrl = ExpoLinking.createURL(redirectPath, {
    queryParams: { calendar_oauth: '1' },
  });

  const { url } = await getClientCalendarConnectUrlAction({ redirectUrl });
  const result = await WebBrowser.openAuthSessionAsync(url, redirectUrl);

  if (result.type === 'success') {
    const callbackError = getErrorFromCallbackUrl(result.url);

    if (callbackError) {
      return { status: 'error', error: callbackError };
    }

    return { status: 'success' };
  }

  if (result.type === 'cancel' || result.type === 'dismiss') {
    return { status: 'cancel' };
  }

  return { status: 'error', error: 'oauth_unexpected_result' };
};
