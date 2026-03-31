import { parseZodIssueMessage } from '@ascencio/shared';
import { t } from 'i18next';

export const getErrorMessage = (fieldError?: { message?: string }) => {
  if (!fieldError?.message) return undefined;
  const parsed = parseZodIssueMessage(fieldError.message);

  if (!parsed.messageKey) return undefined;
  return t(parsed.messageKey, parsed.params);
};
