import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useAuthStore } from '../store/useAuthStore';
import { SignInRequest, SignInResponse, signInSchema } from '@ascencio/shared';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ServerException } from '@/core/interfaces/server-exception.response';

export const useSignIn = () => {
  const { tempEmail, signIn } = useAuthStore();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors: formErrors },
  } = useForm<SignInRequest>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: tempEmail || '',
      password: '',
    },
  });

  const mutation = useMutation<
    SignInResponse,
    AxiosError<ServerException>,
    SignInRequest
  >({
    mutationFn: signIn,
    onError: (error) => {
      console.error(error);
    },
  });

  return {
    formErrors,
    control,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    handleSubmit,
    setError,
    signIn: mutation,
  };
};
