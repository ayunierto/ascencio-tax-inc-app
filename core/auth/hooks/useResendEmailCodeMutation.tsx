import { useMutation } from '@tanstack/react-query';

import { resendCode } from '../actions/resend-code.action';
import { toast } from 'sonner-native';
import { useTranslation } from 'react-i18next';

export interface ResendEmailCodeResponse {
  message: string;
  statusCode?: number;
  error?: string;
}

export const useResendEmailCodeMutation = () => {
  const { t } = useTranslation();
  return useMutation<ResendEmailCodeResponse, Error, string>({
    mutationFn: async (email: string) => {
      return await resendCode(email);
    },
    onSuccess: (response) => {
      toast.success(t(response.message));
    },
    onError: (error) => {
      toast.error(t(error.message));
    },
  });
};
