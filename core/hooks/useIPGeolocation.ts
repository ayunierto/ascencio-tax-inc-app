import { useQuery } from '@tanstack/react-query';
import { api } from '@/core/api/api';

export interface GeolocationProxyResponse {
  callingCode: string | null;
  countryCode: string | null;
  countryName: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
}

const normalizeCallingCode = (
  rawCallingCode?: string | null,
): string | undefined => {
  if (!rawCallingCode) {
    return undefined;
  }

  return rawCallingCode.startsWith('+') ? rawCallingCode : `+${rawCallingCode}`;
};

const useIPGeolocation = () => {
  const getLocaleAction = async (): Promise<GeolocationProxyResponse> => {
    const { data } = await api.get<GeolocationProxyResponse>('/geolocation');
    return data;
  };

  const {
    data: location,
    isPending,
    isSuccess,
    isError,
    error,
  } = useQuery({
    queryKey: ['geolocation'],
    queryFn: getLocaleAction,
    staleTime: 1000 * 60 * 60 * 24, // 1 day to execute the consultation again
    retry: 1,
  });

  const callingCode = normalizeCallingCode(location?.callingCode);

  return {
    location,
    callingCode,
    isLoading: isPending,
    isSuccess,
    isError,
    error,
  };
};

export default useIPGeolocation;
