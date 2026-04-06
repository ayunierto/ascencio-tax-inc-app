import { zodResolver } from '@hookform/resolvers/zod';
import { getLocales } from 'expo-localization';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import useIPGeolocation from '@/core/hooks/useIPGeolocation';
import {
  ServerException,
  SignUpRequest,
  SignUpResponse,
  signUpSchema,
} from '@ascencio/shared';
import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../store';

export interface ValidationError {
  field?: string;
  messageKey: string;
  params?: Record<string, string | number>;
}

export const useSignUp = () => {
  const { callingCode: detectedCallingCode } = useIPGeolocation();
  const [callingCode, setCallingCode] = useState<string | undefined>();
  const { signUp } = useAuthStore();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
    setValue,
  } = useForm<SignUpRequest>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      locale: getLocales()[0].languageTag,
      // countryCode: callingCode,
    },
  });

  // Set the initial calling code based on the user's location
  useEffect(() => {
    if (detectedCallingCode) {
      setCallingCode(detectedCallingCode);
      setValue('countryCode', detectedCallingCode);
    }
  }, [detectedCallingCode, setValue]);

  const mutation = useMutation<
    SignUpResponse,
    AxiosError<ServerException>,
    SignUpRequest
  >({
    mutationFn: signUp,
  });

  return {
    control,
    errors,
    callingCode,
    setError,
    handleSubmit,
    setValue,
    signUp: mutation,
  };
};
